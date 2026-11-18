import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../worker/index.js';

test('booking passes the selected minutes to Supabase', async (context) => {
  const database = 'https://supabase.example.test';
  const origin = 'https://storefront.example.test';
  const environment = {
    SUPABASE_URL: database,
    SUPABASE_PUBLISHABLE_KEY: 'mock',
    BOOKING_API_SECRET: 'mock',
    TURNSTILE_SECRET_KEY: 'mock',
  };

  context.mock.method(globalThis, 'fetch', (url, options) => {
    if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
      return Response.json({ success: true });
    }
    assert.equal(url, database + '/rest/v1/rpc/create_booking_from_worker');
    assert.equal(JSON.parse(options.body).p_slot_start, '09:30:00');
    return Response.json('preview-booking-id');
  });

  const response = await worker.fetch(new Request(origin + '/api/bookings', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Visitor',
      email: 'test@example.test',
      phone: '0000000000',
      date: '2030-01-01',
      time: '09:30-10:00',
      meeting_type: 'video_call',
      meeting_duration_minutes: 15,
      timezone: 'Asia/Shanghai',
      turnstile_token: 'mock',
    }),
  }), environment);

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true, id: 'preview-booking-id' });
});
