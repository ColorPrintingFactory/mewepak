import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../worker/index.js';

test('booking passes the selected schedule time and customer time zone to Supabase', async (context) => {
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
    if (url === database + '/rest/v1/booking_settings_public?select=*&id=eq.1') {
      return Response.json([{ timezone: 'America/Chicago' }]);
    }
    assert.equal(url, database + '/rest/v1/rpc/create_booking_from_worker');
    const booking = JSON.parse(options.body);
    assert.equal(booking.p_slot_start, '09:30:00');
    assert.equal(booking.p_customer_timezone, 'Australia/Sydney');
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
      timezone: 'Australia/Sydney',
      turnstile_token: 'mock',
    }),
  }), environment);

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true, id: 'preview-booking-id' });
});

test('availability excludes started slots and rejects a stale selection', async (context) => {
  const database = 'https://supabase.example.test';
  const origin = 'https://storefront.example.test';
  const environment = {
    SUPABASE_URL: database,
    SUPABASE_PUBLISHABLE_KEY: 'mock',
    BOOKING_API_SECRET: 'mock',
    TURNSTILE_SECRET_KEY: 'mock',
  };
  context.mock.timers.enable({ apis: ['Date'], now: new Date('2030-01-01T16:30:00Z') });
  context.mock.method(globalThis, 'fetch', (url) => {
    if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
      return Response.json({ success: true });
    }
    if (url === database + '/rest/v1/booking_settings_public?select=*&id=eq.1') {
      return Response.json([{
        timezone: 'America/Chicago', advance_days: 7, working_days: [2],
        start_time: '09:00', end_time: '13:00', slot_minutes: 60, max_per_slot: 1,
      }]);
    }
    assert.equal(url, database + '/rest/v1/rpc/get_booked_slot_counts');
    return Response.json([{ slot_start: '11:00:00', booked: 1 }]);
  });

  const availability = await worker.fetch(new Request(origin + '/api/booking-slots?date=2030-01-01'), environment);
  const data = await availability.json();
  assert.deepEqual(data.slots, ['12:00-13:00']);
  assert.equal(data.last_date, '2030-01-08');

  const booking = await worker.fetch(new Request(origin + '/api/bookings', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Visitor', email: 'test@example.test', phone: '0000000000',
      date: '2030-01-01', time: '10:00-11:00', meeting_type: 'video_call',
      meeting_duration_minutes: 15, timezone: 'Australia/Sydney', turnstile_token: 'mock',
    }),
  }), environment);
  assert.equal(booking.status, 409);
});
