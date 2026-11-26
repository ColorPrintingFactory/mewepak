const url = Deno.env.get('SUPABASE_URL') || '';
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

function respond(status: number) {
  return Response.json({ ok: status === 200 }, { status, headers: { 'cache-control': 'no-store' } });
}

function database(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('apikey', key);
  headers.set('authorization', 'Bearer ' + key);
  headers.set('content-type', 'application/json');
  return fetch(url + '/rest/v1/' + path, { ...options, headers });
}

async function authorized(secret: string) {
  if (!secret || secret.length > 512 || !key || !url) return false;
  const result = await database('site_settings?select=value&key=eq.booking_api_secret&is_public=eq.false');
  if (!result.ok) return false;
  const [row] = await result.json();
  const expected = row?.value?.sha256;
  if (!/^[a-f0-9]{64}$/.test(expected || '')) return false;
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret)));
  let diff = 0;
  for (let i = 0; i < bytes.length; i++) diff |= bytes[i] ^ parseInt(expected.slice(i * 2, i * 2 + 2), 16);
  return diff === 0;
}

Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') return respond(405);
  try {
    if (!await authorized(request.headers.get('x-mewepak-gateway-key') || '')) return respond(403);
    const input = await request.json();
    const email = typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respond(400);
    if (input.type === 'newsletter') {
      const source = typeof input.source_page === 'string' && /^\/(?!\/)[a-z0-9/_-]*$/i.test(input.source_page) ? input.source_page.slice(0, 250) : '/';
      const response = await database('newsletter_subscribers?on_conflict=email', {
        method: 'POST', headers: { prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify({ email, source_page: source }),
      });
      return respond(response.ok ? 200 : 502);
    }
    if (input.type !== 'quote') return respond(400);
    const read = (name: string, limit: number) => typeof input[name] === 'string' ? input[name].trim().slice(0, limit) : '';
    const contact_name = read('name', 120);
    const company = read('company', 160);
    const message = read('details', 4000);
    const product_type = read('product_type', 100);
    if (!contact_name || !company || !message || !product_type) return respond(400);
    const response = await database('inquiries', {
      method: 'POST',
      body: JSON.stringify({
        contact_name, company, email, message, product_type,
        phone: read('phone', 60), quantity: read('quantity', 120),
        product_context: read('product_context', 180),
        source_page: /^\/(?!\/)[a-z0-9/_-]*$/i.test(read('source_page', 250)) ? read('source_page', 250) : '',
      }),
    });
    return respond(response.ok ? 200 : 502);
  } catch {
    return respond(502);
  }
});
