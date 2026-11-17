const MAX_BODY_BYTES = 12_000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

function databaseConfig(env, privileged = false) {
  const base = String(env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = String(privileged ? env.SUPABASE_SERVICE_ROLE_KEY : env.SUPABASE_PUBLISHABLE_KEY || '');
  if (!base || !key) throw new Error('Database credentials are not configured.');
  return { base, key };
}

async function databaseRequest(env, path, init = {}, privileged = false) {
  const { base, key } = databaseConfig(env, privileged);
  const headers = new Headers(init.headers || {});
  headers.set('apikey', key);
  headers.set('authorization', `Bearer ${key}`);
  headers.set('accept', 'application/json');
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  return fetch(`${base}/rest/v1/${path}`, { ...init, headers });
}

function cleanText(value, max) {
  return String(value || '').trim().slice(0, max);
}

function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function addCalendarDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function todayInZone(timeZone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dateIsBookable(date, settings, now = new Date()) {
  if (!isCalendarDate(date)) return false;
  const today = todayInZone(settings.timezone || 'UTC', now);
  const lastDate = addCalendarDays(today, Number(settings.advance_days || 0));
  if (date < today || date > lastDate) return false;
  const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay() || 7;
  return Array.isArray(settings.working_days) && settings.working_days.includes(weekday);
}

function slotsForDate(settings) {
  const toMinutes = (value) => {
    const [hours, minutes] = String(value).slice(0, 5).split(':').map(Number);
    return hours * 60 + minutes;
  };
  const start = toMinutes(settings.start_time);
  const end = toMinutes(settings.end_time);
  const interval = Number(settings.slot_minutes);
  if (!Number.isFinite(interval) || interval < 15 || interval > 240 || end <= start) return [];
  const result = [];
  for (let minute = start; minute + interval <= end; minute += interval) {
    const slotEnd = minute + interval;
    const label = (number) => `${String(Math.floor(number / 60)).padStart(2, '0')}:${String(number % 60).padStart(2, '0')}`;
    result.push(`${label(minute)}-${label(slotEnd)}`);
  }
  return result;
}

async function getBookingSettings(env) {
  const response = await databaseRequest(env, 'booking_settings?select=*&id=eq.1', {}, true);
  if (!response.ok) throw new Error('Could not read booking settings.');
  const rows = await response.json();
  if (!rows.length) throw new Error('Booking settings are missing.');
  return rows[0];
}

async function contentResponse(request, env) {
  const definitions = {
    categories: { table: 'product_categories', select: 'id,name,slug,short_description,image_url,menu_group,menu_order', order: 'menu_order.asc', limit: 100 },
    products: { table: 'products', select: 'id,name,slug,short_description,primary_image_url,gallery_urls,is_featured,sort_order,category:product_categories(name,slug)', order: 'sort_order.asc', limit: 24 },
    articles: { table: 'articles', select: 'id,title,slug,excerpt,featured_image_url,published_at', order: 'published_at.desc', limit: 24 },
  };
  const type = new URL(request.url).searchParams.get('type') || '';
  const definition = definitions[type];
  if (!definition) return json({ error: 'Unsupported content type.' }, 400);
  try {
    const query = new URLSearchParams({ select: definition.select, status: 'eq.published', order: definition.order, limit: String(definition.limit) });
    const response = await databaseRequest(env, `${definition.table}?${query}`);
    if (!response.ok) return json({ error: 'Content is unavailable.' }, 502);
    return json(await response.json());
  } catch {
    return json({ error: 'Content is unavailable.' }, 500);
  }
}

async function bookingSlotsResponse(request, env) {
  const date = new URL(request.url).searchParams.get('date') || '';
  if (!isCalendarDate(date)) return json({ error: 'A date in YYYY-MM-DD format is required.' }, 400);
  try {
    const settings = await getBookingSettings(env);
    const publicSettings = {
      date,
      timezone: settings.timezone,
      slots: [],
      meeting_durations: settings.meeting_durations || [15, 30],
      timezones: settings.timezones || {
        'Asia/Shanghai': 'UTC +08:00 China',
        'America/New_York': 'UTC -04:00 New York',
        'Europe/London': 'UTC +01:00 London',
        'Asia/Dubai': 'UTC +04:00 Dubai',
      },
      display_title: settings.display_title || 'Meet with Mewepak',
      display_location: settings.display_location || 'Zoom / Factory Visit',
      avatar_url: settings.avatar_url || '',
    };
    if (!dateIsBookable(date, settings)) return json(publicSettings);
    const query = new URLSearchParams({ select: 'slot_start,status', booking_date: `eq.${date}`, status: 'in.(pending,confirmed)' });
    const response = await databaseRequest(env, `appointments?${query}`, {}, true);
    if (!response.ok) return json({ error: 'Could not read appointment availability.' }, 502);
    const counts = new Map();
    for (const booking of await response.json()) {
      const time = String(booking.slot_start).slice(0, 5);
      counts.set(time, (counts.get(time) || 0) + 1);
    }
    publicSettings.slots = slotsForDate(settings).filter((slot) => (counts.get(slot.slice(0, 5)) || 0) < settings.max_per_slot);
    return json(publicSettings);
  } catch {
    return json({ error: 'Availability is temporarily unavailable.' }, 503);
  }
}

async function readLimitedJson(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) throw Object.assign(new Error('Request is too large.'), { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError('Missing request body.');
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw Object.assign(new Error('Request is too large.'), { status: 413 });
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(body));
}

async function verifyTurnstile(token, secret, remoteIp) {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body,
  });
  return response.ok && (await response.json()).success === true;
}

async function createBookingResponse(request, env) {
  const origin = request.headers.get('origin');
  try {
    if (origin && new URL(origin).origin !== new URL(request.url).origin) return json({ error: 'Cross-origin request rejected.' }, 403);
  } catch { return json({ error: 'Cross-origin request rejected.' }, 403); }
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'JSON is required.' }, 415);

  let input;
  try { input = await readLimitedJson(request); }
  catch (error) { return json({ error: error?.status === 413 ? 'Request is too large.' : 'Invalid request body.' }, error?.status || 400); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return json({ error: 'Invalid request body.' }, 400);

  const contactName = cleanText(input.name, 120);
  const company = cleanText(input.company, 160);
  const email = cleanText(input.email, 254).toLowerCase();
  const phone = cleanText(input.phone, 50);
  const topic = cleanText(input.topic, 2000);
  const meetingType = String(input.meeting_type || '');
  const date = String(input.date || '');
  const slot = String(input.time || '');
  const slotMatch = /^([01]\d|2[0-3]):[0-5]\d(?:-([01]\d|2[0-3]):[0-5]\d)?$/.exec(slot);
  const duration = Number(input.meeting_duration_minutes ?? input.duration_minutes ?? input.duration);
  const timezone = cleanText(input.customer_timezone ?? input.timezone, 80);
  const turnstileToken = String(input.turnstile_token || '');
  if (contactName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length < 5 || !isCalendarDate(date) || !slotMatch || !['video_call', 'factory_visit'].includes(meetingType) || !Number.isInteger(duration) || duration < 5 || duration > 240 || !timezone || !turnstileToken) {
    return json({ error: 'Please check the required booking details.' }, 400);
  }
  try { new Intl.DateTimeFormat('en-US', { timeZone: timezone }); }
  catch { return json({ error: 'Please select a valid time zone.' }, 400); }

  const secret = String(env.TURNSTILE_SECRET_KEY || '');
  if (!secret) return json({ error: 'Booking protection is not configured.' }, 503);
  try {
    const verified = await verifyTurnstile(turnstileToken, secret, request.headers.get('cf-connecting-ip') || '');
    if (!verified) return json({ error: 'Verification failed. Please try again.' }, 400);
    const modernPayload = {
      p_booking_date: date, p_slot_start: `${slotMatch[1]}:00`, p_contact_name: contactName,
      p_company: company, p_email: email, p_phone: phone, p_topic: topic,
      p_meeting_type: meetingType, p_meeting_duration_minutes: duration, p_customer_timezone: timezone,
    };
    let response = await databaseRequest(env, 'rpc/create_booking', { method: 'POST', body: JSON.stringify(modernPayload) }, true);
    if (response.status === 404) {
      const legacyPayload = { ...modernPayload };
      delete legacyPayload.p_meeting_duration_minutes;
      delete legacyPayload.p_customer_timezone;
      response = await databaseRequest(env, 'rpc/create_booking', { method: 'POST', body: JSON.stringify(legacyPayload) }, true);
    }
    const result = await response.json().catch(() => null);
    if (response.status === 409) return json({ error: 'That time is no longer available. Please choose another slot.' }, 409);
    if (response.status === 400) return json({ error: 'That booking option is unavailable.' }, 400);
    if (!response.ok) return json({ error: 'The appointment could not be saved.' }, 502);
    return json({ ok: true, id: result }, 201);
  } catch {
    return json({ error: 'The appointment service is temporarily unavailable.' }, 503);
  }
}

function withSecurityHeaders(response, path) {
  const result = new Response(response.body, response);
  result.headers.set('x-content-type-options', 'nosniff');
  result.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  result.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  const admin = path.startsWith('/admin');
  result.headers.set('content-security-policy', admin
    ? "default-src 'self'; script-src 'self' https://esm.sh; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://esm.sh; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
    : "default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'");
  return result;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/config' && request.method === 'GET') {
      const supabaseUrl = String(env.SUPABASE_URL || '').trim();
      const supabasePublishableKey = String(env.SUPABASE_PUBLISHABLE_KEY || '').trim();
      return json({ configured: Boolean(supabaseUrl && supabasePublishableKey), supabaseUrl, supabasePublishableKey, turnstileSiteKey: String(env.TURNSTILE_SITE_KEY || '').trim() }, supabaseUrl && supabasePublishableKey ? 200 : 503);
    }
    if (url.pathname === '/api/content' && request.method === 'GET') return contentResponse(request, env);
    if (url.pathname === '/api/booking-slots' && request.method === 'GET') return bookingSlotsResponse(request, env);
    if (url.pathname === '/api/bookings' && request.method === 'POST') return createBookingResponse(request, env);
    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found.' }, 404);
    return withSecurityHeaders(await env.ASSETS.fetch(request), url.pathname);
  },
};
