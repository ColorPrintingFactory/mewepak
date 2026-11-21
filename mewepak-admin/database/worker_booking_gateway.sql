-- Allow the public Worker to read only safe booking configuration and slot
-- counts, while keeping appointment records and notification settings private.

create or replace view public.booking_settings_public
with (security_invoker = false)
as
select
  id, working_days, start_time, end_time, slot_minutes, max_per_slot,
  advance_days, timezone, meeting_durations, timezones, display_title,
  display_location, avatar_url, updated_at
from public.booking_settings;

revoke all on public.booking_settings_public from public;
grant select on public.booking_settings_public to anon, authenticated, service_role;

create or replace function public.get_booked_slot_counts(p_booking_date date)
returns table(slot_start time, booked bigint)
language sql
stable
security definer
set search_path = public
as $$
  select a.slot_start, count(*)::bigint
  from public.appointments a
  where a.booking_date = p_booking_date
    and a.status in ('pending', 'confirmed')
  group by a.slot_start
  order by a.slot_start;
$$;

revoke all on function public.get_booked_slot_counts(date) from public;
grant execute on function public.get_booked_slot_counts(date) to anon, authenticated, service_role;

create or replace function public.create_booking_from_worker(
  p_booking_date date,
  p_slot_start time,
  p_contact_name text,
  p_company text,
  p_email text,
  p_phone text,
  p_topic text,
  p_meeting_type text,
  p_meeting_duration_minutes integer,
  p_customer_timezone text,
  p_api_secret text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  expected_hash text;
begin
  select value ->> 'sha256' into expected_hash
  from public.site_settings
  where key = 'booking_api_secret';

  if expected_hash is null
     or encode(digest(coalesce(p_api_secret, ''), 'sha256'), 'hex') <> expected_hash then
    raise exception using errcode = '42501', message = 'booking_gateway_denied';
  end if;

  return public.create_booking(
    p_booking_date, p_slot_start, p_contact_name, p_company, p_email,
    p_phone, p_topic, p_meeting_type, p_meeting_duration_minutes,
    p_customer_timezone
  );
end;
$$;

revoke all on function public.create_booking_from_worker(date, time, text, text, text, text, text, text, integer, text, text) from public;
grant execute on function public.create_booking_from_worker(date, time, text, text, text, text, text, text, integer, text, text) to anon, service_role;
