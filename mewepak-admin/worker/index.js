import { dispatchLeadNotifications } from './notifications.js';
import { optimizePageSeo, publishedSeoPaths, seoEndpoint, seoPolicy } from './seo.js';
import { detectLocale, localizedResponse } from './i18n.js';
import { localizeSharedPage } from './localized-home.js';
import { toolMetadata } from './i18n/tools.js';
import { serveCms, frontendNavigation } from './cms.js';
import { connectStorefront, publicSiteSettings } from './storefront.js';
import { notFoundPage } from './not-found.js';
import { applyCategoryTemplate } from './category-template.js';

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
  const key = String(privileged ? (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_PUBLISHABLE_KEY) : env.SUPABASE_PUBLISHABLE_KEY || '');
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

function scheduleClock(timeZone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}` };
}

function dateIsBookable(date, settings, today, lastDate) {
  if (!isCalendarDate(date) || date < today || date > lastDate) return false;
  const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay() || 7;
  return Array.isArray(settings.working_days) && settings.working_days.includes(weekday);
}

function slotHasNotStarted(date, start, clock) {
  return date > clock.date || (date === clock.date && start > clock.time);
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
  const response = await databaseRequest(env, 'booking_settings_public?select=*&id=eq.1');
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

async function availableSlots(env, date, settings, clock) {
  const windows = slotsForDate(settings).filter((slot) => slotHasNotStarted(date, slot.slice(0, 5), clock));
  if (!windows.length) return [];
  const response = await databaseRequest(env, 'rpc/get_booked_slot_counts', {
    method: 'POST', body: JSON.stringify({ p_booking_date: date }),
  });
  if (!response.ok) return null;
  const counts = new Map((await response.json()).map(({ slot_start, booked }) =>
    [String(slot_start).slice(0, 5), Number(booked || 0)]));
  return windows.filter((slot) => (counts.get(slot.slice(0, 5)) || 0) < settings.max_per_slot);
}

async function upcomingBookingResponse(env) {
  try {
    const settings = await getBookingSettings(env);
    const timezone = settings.timezone || 'UTC';
    const clock = scheduleClock(timezone);
    const lastDate = addCalendarDays(clock.date, Math.min(Number(settings.advance_days || 0), 13));
    const slots = [];
    for (let date = clock.date; date <= lastDate && slots.length < 4; date = addCalendarDays(date, 1)) {
      if (!dateIsBookable(date, settings, clock.date, lastDate)) continue;
      const windows = await availableSlots(env, date, settings, clock);
      if (!windows) return json({ error: 'Could not read appointment availability.' }, 502);
      slots.push(...windows.slice(0, 4 - slots.length).map((window) => ({ date, window })));
    }
    return json({ timezone, slots });
  } catch {
    return json({ error: 'Availability is temporarily unavailable.' }, 503);
  }
}

async function bookingSlotsResponse(request, env) {
  const date = new URL(request.url).searchParams.get('date') || '';
  if (!isCalendarDate(date)) return json({ error: 'A date in YYYY-MM-DD format is required.' }, 400);
  try {
    const settings = await getBookingSettings(env);
    const clock = scheduleClock(settings.timezone || 'UTC');
    const lastDate = addCalendarDays(clock.date, Number(settings.advance_days || 0));
    const publicSettings = {
      date,
      last_date: lastDate,
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
    if (!dateIsBookable(date, settings, clock.date, lastDate)) return json(publicSettings);
    const slots = await availableSlots(env, date, settings, clock);
    if (!slots) return json({ error: 'Could not read appointment availability.' }, 502);
    publicSettings.slots = slots;
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

async function verifyTurnstile(token, secret, remoteIp, expected = null) {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body,
  });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true && (!expected || (result.action === expected.action && result.hostname === expected.hostname));
}

async function storefrontSubmission(request, env, type) {
  const requestUrl = new URL(request.url);
  if (request.headers.get('origin') !== requestUrl.origin) return json({ error: 'Cross-origin request rejected.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'JSON is required.' }, 415);
  let input;
  try { input = await readLimitedJson(request); }
  catch (error) { return json({ error: 'Invalid or oversized form.' }, error.status || 400); }
  const email = typeof input?.email === 'string' ? input.email.trim() : '';
  const token = typeof input?.turnstile_token === 'string' ? input.turnstile_token : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !token || token.length > 2048) {
    return json({ error: 'Check your email and complete verification.' }, 400);
  }
  if (type === 'quote' && !['name', 'company', 'details', 'product_type'].every((key) => typeof input[key] === 'string' && input[key].trim())) {
    return json({ error: 'Complete all required fields.' }, 400);
  }
  if (!env.BOOKING_API_SECRET || !env.TURNSTILE_SECRET_KEY) return json({ error: 'Submission service unavailable.' }, 503);
  try {
    if (!await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, request.headers.get('cf-connecting-ip'), { action: type, hostname: requestUrl.hostname })) {
      return json({ error: 'Verification expired or failed. Please retry.' }, 400);
    }
    const { base, key } = databaseConfig(env);
    const response = await fetch(base + '/functions/v1/storefront-submissions', {
      method: 'POST',
      headers: { apikey: key, 'content-type': 'application/json', 'x-mewepak-gateway-key': env.BOOKING_API_SECRET },
      body: JSON.stringify({ ...input, turnstile_token: undefined, type }),
    });
    return response.ok ? json({ ok: true }, 201) : json({ error: 'Could not save your submission. Please retry.' }, 502);
  } catch {
    return json({ error: 'Submission service unavailable. Please retry.' }, 503);
  }
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
    const bookingApiSecret = String(env.BOOKING_API_SECRET || '');
    if (!bookingApiSecret) return json({ error: 'Booking protection is not configured.' }, 503);
    const settings = await getBookingSettings(env);
    if (!slotHasNotStarted(date, slot.slice(0, 5), scheduleClock(settings.timezone || 'UTC'))) {
      return json({ error: 'That time has already started. Please choose another slot.' }, 409);
    }
    const modernPayload = {
      p_booking_date: date, p_slot_start: `${slot.slice(0, 5)}:00`, p_contact_name: contactName,
      p_company: company, p_email: email, p_phone: phone, p_topic: topic,
      p_meeting_type: meetingType, p_meeting_duration_minutes: duration, p_customer_timezone: timezone,
      p_api_secret: bookingApiSecret,
    };
    const response = await databaseRequest(env, 'rpc/create_booking_from_worker', { method: 'POST', body: JSON.stringify(modernPayload) });
    const result = await response.json().catch(() => null);
    if (response.status === 409) return json({ error: 'That time is no longer available. Please choose another slot.' }, 409);
    if (response.status === 400) return json({ error: 'That booking option is unavailable.' }, 400);
    if (!response.ok) return json({ error: 'The appointment could not be saved.' }, 502);
    return json({ ok: true, id: result }, 201);
  } catch {
    return json({ error: 'The appointment service is temporarily unavailable.' }, 503);
  }
}

function withSecurityHeaders(response, path, env, settings) {
  const result = new Response(response.body, response);
  result.headers.set('x-content-type-options', 'nosniff');
  result.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  result.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  const admin = path.startsWith('/admin');
  const storageOrigin = /^https:\/\/[a-z0-9]+\.supabase\.co\/?$/i.test(env.SUPABASE_URL || '') ? env.SUPABASE_URL.replace(/\/$/, '') : '';
  const videoUrl = settings?.factory_tour?.video_url;
  let mediaOrigin = '';
  if (videoUrl) {
    const video = new URL(videoUrl, 'https://mewepak.invalid');
    if (video.protocol === 'https:' && video.hostname !== 'mewepak.invalid') mediaOrigin = ' ' + video.origin;
  }
  result.headers.set('content-security-policy', admin
    ? "default-src 'self'; script-src 'self' https://esm.sh; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://esm.sh; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
    : `default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' ${storageOrigin}${mediaOrigin}; connect-src 'self' blob: https://challenges.cloudflare.com ${storageOrigin}; frame-src https://challenges.cloudflare.com; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'`);
  return result;
}

async function fetchStaticAsset(request, env, context) {
  if (env.ASSETS && typeof env.ASSETS.fetch === 'function') return env.ASSETS.fetch(request);
  if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed.', { status: 405, headers: { allow: 'GET, HEAD' } });
  const commit = cleanText(env.ASSET_COMMIT_SHA, 64);
  if (!/^[a-f0-9]{40}$/.test(commit)) return new Response('Static asset source is not configured.', { status: 503 });
  const url = new URL(request.url);
  const pathname = url.pathname;
  const requestedPath = pathname.endsWith('/') ? `${pathname}index.html`
    : /\.[a-z0-9]+$/i.test(pathname) || pathname.startsWith('/assets/') ? pathname : `${pathname}/index.html`;
  const upstream = `https://raw.githubusercontent.com/ColorPrintingFactory/mewepak/${commit}/mewepak-admin/public${requestedPath}`;
  const cacheUrl = new URL(request.url);
  cacheUrl.pathname = requestedPath;
  cacheUrl.search = `?__asset_commit=${commit}`;
  const cacheKey = new Request(cacheUrl.toString(), { headers: { accept: request.headers.get('accept') || '*/*' } });
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return request.method === 'HEAD' ? new Response(null, cached) : cached;
  let response = await fetch(upstream, { headers: { accept: request.headers.get('accept') || '*/*' } });
  if (!response.ok && response.status !== 404) {
    const mirror = `https://cdn.jsdelivr.net/gh/ColorPrintingFactory/mewepak@${commit}/mewepak-admin/public${requestedPath}`;
    response = await fetch(mirror, { headers: { accept: request.headers.get('accept') || '*/*' } });
  }
  if (!response.ok) return new Response(response.status === 404 ? 'Not found.' : 'Static asset unavailable.', { status: response.status });
  const headers = new Headers(response.headers);
  const extension = requestedPath.split('.').pop()?.toLowerCase() || '';
  const mimeTypes = {
    html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8',
    json: 'application/json; charset=utf-8', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    webp: 'image/webp', svg: 'image/svg+xml', glb: 'model/gltf-binary', ico: 'image/x-icon', pdf: 'application/pdf', csv: 'text/csv; charset=utf-8',
  };
  if (mimeTypes[extension]) headers.set('content-type', mimeTypes[extension]);
  headers.set('cache-control', requestedPath.endsWith('.html') ? 'public, max-age=60' : 'public, max-age=31536000, immutable');
  const result = new Response(response.body, { status: response.status, headers });
  if (context?.waitUntil) context.waitUntil(cache.put(cacheKey, result.clone()));
  return request.method === 'HEAD' ? new Response(null, result) : result;
}

function patchAdminAppScript(script) {
  const editorAnchor = "  languages: { title: '语言入口', fields: [] },";
  if (!script.includes("social_media: { title: '社交媒体'") && script.includes(editorAnchor)) {
    const editor = `  social_media: { title: '社交媒体', fields: [
    { name: 'whatsapp_url', label: 'WhatsApp 链接', full: true, help: '例如：https://wa.me/8613537663353' },
    { name: 'facebook_url', label: 'Facebook 链接', full: true },
    { name: 'instagram_url', label: 'Instagram 链接', full: true },
    { name: 'linkedin_url', label: 'LinkedIn 链接', full: true },
    { name: 'twitter_url', label: 'X / Twitter 链接', full: true },
    { name: 'youtube_url', label: 'YouTube 链接', full: true },
    { name: 'tiktok_url', label: 'TikTok 链接', full: true },
    { name: 'pinterest_url', label: 'Pinterest 链接', full: true },
  ] },
  languages: { title: '语言入口', fields: [] },`;
    script = script.replace(editorAnchor, editor);
    const summaryAnchor = "  if (row.key === 'factory_tour') return value.video_url ? '已设置视频' : '尚未上传视频';\n  if (row.key === 'languages') return value.links?.length ? value.links.map((link) => link.label).join('、') : '尚未添加其他语言入口';";
    const summary = `  if (row.key === 'factory_tour') return value.video_url ? '已设置视频' : '尚未上传视频';
  if (row.key === 'social_media') {
    const active = ['whatsapp_url','facebook_url','instagram_url','linkedin_url','twitter_url','youtube_url','tiktok_url','pinterest_url'].filter((key) => value[key]).length;
    return active ? '已设置 ' + active + ' 个社媒入口' : '尚未添加社媒链接';
  }
  if (row.key === 'languages') return value.links?.length ? value.links.map((link) => link.label).join('、') : '尚未添加其他语言入口';`;
    script = script.replace(summaryAnchor, summary);
    script = script.replace('修改网站名称、联系方式、工厂视频和语言入口。', '修改网站名称、联系方式、社交媒体、工厂视频和语言入口。');
  }

  script = script.replace(
    "    if (field.type === 'datetime-local' && value) inputValue = String(value).slice(0,16);",
    "    if (field.type === 'datetime-local' && value) { const date = new Date(value); const pad = (part) => String(part).padStart(2, '0'); if (!Number.isNaN(date.valueOf())) inputValue = date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()); }"
  );
  script = script.replace(
    '<div class="field"><label for="booking-email">通知邮箱</label><input class="control" id="booking-email" name="notification_email" type="email"',
    '<div class="field"><label for="booking-email">预约 / 询价通知邮箱</label><input class="control" id="booking-email" name="notification_email" type="email"'
  );
  script = script.replace(
    "    if (module !== 'media') payload.updated_at = new Date().toISOString();",
    "    if (module === 'articles' && payload.status === 'published' && !payload.published_at) { const existing = moduleState.get('articles')?.find((row) => String(row.id) === String(id)); payload.published_at = existing?.published_at || new Date().toISOString(); }\n    if (module !== 'media') payload.updated_at = new Date().toISOString();"
  );
  script = script.replace(
    "{ name: 'status', label: '状态', type: 'select', options: [['published', '已发布'], ['draft', '草稿'], ['archived', '已下架']] },",
    "{ name: 'status', label: '状态', type: 'select', value: 'draft', options: [['draft', '草稿'], ['published', '已发布'], ['archived', '已下架']] },"
  );
  const oldUpdate = "async function updateStatus(table, id, status) {\n  const { error } = await supabase.from(table).update({ status, updated_at: new Date().toISOString() }).eq('id', id);";
  const newUpdate = "async function updateStatus(table, id, status) {\n  const payload = { status, updated_at: new Date().toISOString() };\n  if (table === 'articles' && status === 'published') { const existing = moduleState.get('articles')?.find((row) => String(row.id) === String(id)); if (!existing?.published_at) payload.published_at = new Date().toISOString(); }\n  const { error } = await supabase.from(table).update(payload).eq('id', id);";
  script = script.replace(oldUpdate, newUpdate);
  if (!script.includes('data-action="change-password"')) {
    script = script.replace(
      "  logout: '<path d=\"M10 17l5-5-5-5M15 12H3M21 3v18\"/>',",
      "  lock: '<rect x=\"5\" y=\"10\" width=\"14\" height=\"11\" rx=\"2\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3M12 14v3\"/>',\n  logout: '<path d=\"M10 17l5-5-5-5M15 12H3M21 3v18\"/>',"
    );
    script = script.replace(
      '<span class="user-name">${esc(email)}</span><button type="button" class="icon-btn" data-action="signout" aria-label="退出登录">${icon(\'logout\')}</button>',
      '<span class="user-name">${esc(email)}</span><button type="button" class="icon-btn" data-action="change-password" aria-label="修改密码" title="修改密码">${icon(\'lock\')}</button><button type="button" class="icon-btn" data-action="signout" aria-label="退出登录">${icon(\'logout\')}</button>'
    );
    const passwordFunction = `function openPasswordDialog() {
  dialog.innerHTML = \`<form id="password-form"><div class="dialog-head"><h2>修改登录密码</h2><button class="icon-btn" type="button" data-close aria-label="关闭">×</button></div><div class="dialog-body"><div class="field-grid"><div class="field full"><label for="new-password">新密码</label><input class="control" id="new-password" name="password" type="password" autocomplete="new-password" minlength="12" required><span class="field-help">至少 12 位，建议同时包含大小写字母、数字和符号。</span></div><div class="field full"><label for="confirm-password">确认新密码</label><input class="control" id="confirm-password" name="confirm" type="password" autocomplete="new-password" minlength="12" required></div></div><div class="error-box" role="alert" hidden></div></div><div class="dialog-foot"><button class="btn btn-plain" type="button" data-close>取消</button><button class="btn btn-primary" type="submit">更新密码</button></div></form>\`;
  const form = dialog.querySelector('#password-form');
  form.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = form.elements.password.value;
    const confirm = form.elements.confirm.value;
    const errorBox = form.querySelector('.error-box');
    const button = form.querySelector('[type="submit"]');
    errorBox.hidden = true;
    if (password !== confirm) { errorBox.textContent = '两次输入的密码不一致。'; errorBox.hidden = false; return; }
    if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      errorBox.textContent = '密码至少 12 位，并需要包含大小写字母、数字和符号。'; errorBox.hidden = false; return;
    }
    button.disabled = true; button.textContent = '正在更新…';
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { errorBox.textContent = error.message || '密码更新失败，请重试。'; errorBox.hidden = false; button.disabled = false; button.textContent = '更新密码'; return; }
    dialog.close(); showToast('密码已更新，请妥善保存新密码。');
  });
  dialog.showModal();
}

`;
    script = script.replace('function setupView() {', passwordFunction + 'function setupView() {');
    script = script.replace(
      "  app.querySelector('[data-action=\"signout\"]')?.addEventListener('click', async () => {",
      "  app.querySelector('[data-action=\"change-password\"]')?.addEventListener('click', openPasswordDialog);\n  app.querySelector('[data-action=\"signout\"]')?.addEventListener('click', async () => {"
    );
  }
  return script;
}

function patchStorefrontFormsScript(script) {
  if (!script.includes('verificationTimer = setTimeout')) return script;
  script = script.replace('    let verificationTimer;\n', '');
  script = script.replaceAll('      clearTimeout(verificationTimer);\n', '');
  script = script.replaceAll('              clearTimeout(verificationTimer);\n', '');
  script = script.replace("appearance: 'interaction-only', retry: 'never',", "appearance: 'interaction-only', retry: 'auto',");
  script = script.replace("        verificationTimer = setTimeout(() => failVerification(formVerification || 'Verification is taking too long. Please try again.'), 15000);\n", '');
  return script;
}

function patchCategoryBookingScript(script) {
  if (script.includes('mewepakCategoryEnquiryV1')) return script;
  const anchor = '(async () => {\n';
  if (!script.includes(anchor)) return script;
  const transfer = `(async () => {
  const enquiryForm = document.querySelector('form[data-category-enquiry]');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!enquiryForm.reportValidity()) return;
      const data = new FormData(enquiryForm);
      const field = (name) => String(data.get(name) || '').trim();
      const payload = {
        category: field('category').slice(0, 120), name: field('name').slice(0, 120),
        email: field('email').slice(0, 254), company: field('company').slice(0, 160),
        country: field('country').slice(0, 100), application: field('application').slice(0, 160),
        quantity: field('quantity').slice(0, 100), dimensions: field('dimensions').slice(0, 120),
        format: field('format').slice(0, 160), notes: field('notes').slice(0, 1500),
      };
      try { sessionStorage.setItem('mewepakCategoryEnquiryV1', JSON.stringify(payload)); } catch {}
      window.location.assign('/inquiry/#quote-request');
    });
  }
`;
  return script.replace(anchor, transfer);
}

function patchQuoteScript(script) {
  if (script.includes('mewepakCategoryEnquiryV1')) return script;
  const anchor = '  showStep(0, false);\n';
  if (!script.includes(anchor)) return script;
  const restore = `  showStep(0, false);

  try {
    const stored = sessionStorage.getItem('mewepakCategoryEnquiryV1');
    if (stored) {
      sessionStorage.removeItem('mewepakCategoryEnquiryV1');
      const source = JSON.parse(stored);
      const setValue = (name, value) => {
        const control = form.elements.namedItem(name);
        if (control && typeof value === 'string' && value.trim()) control.value = value.trim();
      };
      setValue('product', source.application);
      setValue('quantity', source.quantity);
      setValue('size', source.dimensions);
      setValue('name', source.name);
      setValue('email', source.email);
      setValue('company', source.company);
      setValue('region', source.country);
      const context = [
        source.category ? 'Requested category: ' + source.category : '',
        source.format ? 'Format interest: ' + source.format : '',
        source.notes || '',
      ].filter(Boolean).join('\\n');
      if (context) form.elements.notes.value = context.slice(0, 1500);
    }
  } catch {
    sessionStorage.removeItem('mewepakCategoryEnquiryV1');
  }

`;
  return script.replace(anchor, restore);
}

function storefrontCacheKey(request, url, env, context) {
  // Cache only anonymous, query-free storefront pages. The commit partitions deployments.
  if (!context?.waitUntil || request.method !== 'GET' || url.search || !env.ASSET_COMMIT_SHA ||
      request.headers.has('authorization') || request.headers.has('cookie') ||
      /^\/(?:admin|assets|search|booking|3d-preview)(?:\/|$)/.test(url.pathname) ||
      !/^\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]*$/i.test(url.pathname)) return null;
  const key = new URL(url);
  key.searchParams.set('__storefront_commit', env.ASSET_COMMIT_SHA);
  return new Request(key);
}

function serveCachedPage(response, status) {
  const result = new Response(response.body, response);
  // Keep browser refreshes predictable while the edge copy has its own short TTL.
  result.headers.set('cache-control', 'no-store');
  result.headers.set('x-mewepak-cache', status);
  return result;
}

export default {
  async scheduled(_controller, env) {
    await dispatchLeadNotifications(env, (path, options) => databaseRequest(env, path, options));
  },
  async fetch(request, env, context) {
    const url = new URL(request.url);
    if (url.pathname === '/api/config' && request.method === 'GET') {
      const supabaseUrl = String(env.SUPABASE_URL || '').trim();
      const supabasePublishableKey = String(env.SUPABASE_PUBLISHABLE_KEY || '').trim();
      return json({ configured: Boolean(supabaseUrl && supabasePublishableKey), supabaseUrl, supabasePublishableKey, turnstileSiteKey: String(env.TURNSTILE_SITE_KEY || '').trim() }, supabaseUrl && supabasePublishableKey ? 200 : 503);
    }
    const database = (path) => databaseRequest(env, path);
    const getAsset = (path) => fetchStaticAsset(new Request(new URL(path, url)), env, context);
    const seo = await seoEndpoint(request, env, database, getAsset);
    if (seo) return seo;
    const locale = detectLocale(url.pathname);
    const sharedPage = locale && request.method === 'GET' &&
      (Object.hasOwn(toolMetadata, locale.path) || (locale.path === '/' && !url.searchParams.has('s')));
    if (sharedPage && url.pathname !== locale.canonicalPath) {
      url.pathname = locale.canonicalPath;
      return Response.redirect(url,301);
    }
    if (locale && !sharedPage) {
      const policy = seoPolicy(url,env);
      try {
        const [paths, settings] = await Promise.all([
          publishedSeoPaths(database,getAsset), publicSiteSettings(database).catch(() => ({})),
        ]);
        const response = await localizedResponse(request, locale, { policy, settings, paths });
        return withSecurityHeaders(response, url.pathname, env, settings);
      } catch {
        return new Response(null,{ status:503, headers:{ 'retry-after':'60', 'x-robots-tag':'noindex' } });
      }
    }
    if (url.pathname === '/admin' && ['GET', 'HEAD'].includes(request.method)) {
      url.pathname = '/admin/';
      return Response.redirect(url, 308);
    }
    if (url.pathname === '/admin/' && request.method === 'GET') {
      const adminPage = await fetchStaticAsset(request, env, context);
      if (!adminPage.ok) return withSecurityHeaders(adminPage, url.pathname, env);
      const headers = new Headers(adminPage.headers);
      headers.set('content-type', 'text/html; charset=utf-8');
      headers.set('cache-control', 'no-store');
      headers.delete('content-length');
      const html = (await adminPage.text()).replace('/admin/app.js?v=site-settings-3', '/admin/app.js?v=site-settings-4');
      return withSecurityHeaders(new Response(html, { status: 200, headers }), url.pathname, env);
    }
    if (url.pathname === '/admin/app.js' && request.method === 'GET') {
      const adminAsset = await fetchStaticAsset(request, env, context);
      if (!adminAsset.ok) return withSecurityHeaders(adminAsset, url.pathname, env);
      const headers = new Headers(adminAsset.headers);
      headers.set('content-type', 'text/javascript; charset=utf-8');
      headers.set('cache-control', 'no-store');
      headers.delete('content-length');
      const script = patchAdminAppScript(await adminAsset.text());
      return withSecurityHeaders(new Response(script, { status: 200, headers }), url.pathname, env);
    }
    const scriptPatcher = {
      '/assets/storefront-forms.js': patchStorefrontFormsScript,
      '/assets/category-booking.js': patchCategoryBookingScript,
      '/assets/client-design/quote.js': patchQuoteScript,
    }[url.pathname];
    if (scriptPatcher && request.method === 'GET') {
      const source = await fetchStaticAsset(request, env, context);
      if (!source.ok) return withSecurityHeaders(source, url.pathname, env);
      const headers = new Headers(source.headers);
      headers.set('content-type', 'text/javascript; charset=utf-8');
      headers.set('cache-control', 'no-store');
      headers.delete('content-length');
      return withSecurityHeaders(new Response(scriptPatcher(await source.text()), { status: 200, headers }), url.pathname, env);
    }
    if (url.pathname === '/api/public-site' && request.method === 'GET') {
      try { return json(await publicSiteSettings(database)); }
      catch { return json({}, 503); }
    }
    if (url.pathname === '/api/frontend-navigation' && request.method === 'GET') return frontendNavigation(database);
    if (url.pathname === '/api/content' && request.method === 'GET') return contentResponse(request, env);
    if (url.pathname === '/api/booking-slots' && request.method === 'GET') return bookingSlotsResponse(request, env);
    if (url.pathname === '/api/booking-upcoming' && request.method === 'GET') return upcomingBookingResponse(env);
    if (url.pathname === '/api/bookings' && request.method === 'POST') return createBookingResponse(request, env);
    if (request.method === 'POST' && ['/api/submissions/quote', '/api/submissions/newsletter'].includes(url.pathname)) {
      return storefrontSubmission(request, env, url.pathname.split('/').pop());
    }
    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found.' }, 404);
    const aliases = {
      '/assets/original/storefront-navigation.js': '/assets/original/main.js',
      '/assets/client-design/market-browser.js': '/assets/client-design/markets.js',
    };
    const assetPath = aliases[url.pathname];
    const contentRequest = sharedPage ? new Request(new URL(locale.path + url.search,url),request) : request;
    const assetRequest = typeof assetPath === 'string' ? new Request(new URL(assetPath, url), request) : contentRequest;
    const cacheKey = storefrontCacheKey(request, url, env, context);
    const pageCache = cacheKey ? caches.default : null;
    if (pageCache) {
      const cached = await pageCache.match(cacheKey);
      if (cached) return serveCachedPage(cached, 'HIT');
    }
    const started = Date.now();
    const documentRequest = request.method === 'GET' && !/^\/(?:admin|assets)(?:\/|$)/.test(url.pathname) &&
      !/\.[a-z0-9]+$/i.test(url.pathname);
    const preparedSettings = documentRequest ? publicSiteSettings(database).catch(() => ({})) : null;
    const defaults = documentRequest ? getAsset('/assets/original/seo-page-defaults.json').catch(() => null) : null;
    const asset = await fetchStaticAsset(assetRequest, env, context);
    // Forward redirects for the public URL before selecting a CMS fallback template.
    if (assetRequest === request && asset.status >= 300 && asset.status < 400 && asset.headers.has('location')) {
      return withSecurityHeaders(asset, url.pathname, env);
    }
    let page;
    let catalog;
    let previous;
    let settings;
    const cms = await serveCms(contentRequest, asset, database, getAsset, (entry, entries, baseline) => {
      page = entry;
      catalog = entries;
      previous = baseline;
    });
    if (documentRequest && cms.status === 404) return withSecurityHeaders(notFoundPage(locale?.lang), url.pathname, env);
    const storefront = await connectStorefront(
      contentRequest, cms, database, env.SUPABASE_URL, (value) => { settings = value; }, preparedSettings,
      env.ENVIRONMENT === 'preview',
    );
    const seoAsset = (path) => defaults && path === '/assets/original/seo-page-defaults.json' ? defaults : getAsset(path);
    const categoryStorefront = await applyCategoryTemplate(request, storefront, database);
    const localized = sharedPage ? localizeSharedPage(categoryStorefront, locale, url.search, settings) : categoryStorefront;
    const rendered = await optimizePageSeo(request, localized, env, seoAsset, { page, catalog, previous, settings, locale: sharedPage ? locale : null });
    const result = withSecurityHeaders(rendered, url.pathname, env, settings);
    if (!pageCache || !result.ok || !catalog || !settings?.usLocations ||
        !result.headers.get('content-type')?.includes('text/html') || result.headers.has('set-cookie')) return result;
    result.headers.set('server-timing', `storefront;dur=${Date.now() - started}`);
    const edge = new Response(result.clone().body, result);
    edge.headers.set('cache-control', 'public, max-age=20');
    edge.headers.delete('server-timing');
    context.waitUntil(pageCache.put(cacheKey, edge).catch(() => {}));
    return serveCachedPage(result, 'MISS');
  },
};
