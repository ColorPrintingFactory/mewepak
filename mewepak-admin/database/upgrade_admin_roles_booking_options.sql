-- Upgrade the existing Mewepak CMS project in place.
-- This migration adds current booking page options and enforces admin-only access
-- for appointments, inquiries, private site settings, and booking settings.

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.booking_settings
  add column if not exists meeting_durations integer[] not null default array[15,30]::integer[],
  add column if not exists timezones jsonb not null default '{"Asia/Shanghai":"UTC +08:00 China","America/New_York":"UTC -04:00 New York","Europe/London":"UTC +01:00 London","Asia/Dubai":"UTC +04:00 Dubai"}'::jsonb,
  add column if not exists display_title text not null default 'Meet with Mewepak',
  add column if not exists display_location text not null default 'Zoom / Factory Visit',
  add column if not exists avatar_url text not null default '',
  add column if not exists notification_email text not null default '';

alter table public.appointments
  add column if not exists meeting_duration_minutes integer not null default 15,
  add column if not exists customer_timezone text not null default 'Asia/Shanghai';

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists inquiries_product_id_idx on public.inquiries(product_id);
create index if not exists model_assets_product_id_idx on public.model_assets(product_id);

-- Public visitors use the anon role; authenticated staff use their staff policy.
drop policy if exists categories_public_read on public.product_categories;
create policy categories_public_read on public.product_categories
  for select to anon using (status = 'published');
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon using (status = 'published');
drop policy if exists pages_public_read on public.pages;
create policy pages_public_read on public.pages
  for select to anon using (status = 'published');
drop policy if exists articles_public_read on public.articles;
create policy articles_public_read on public.articles
  for select to anon using (status = 'published');
drop policy if exists models_public_read on public.model_assets;
create policy models_public_read on public.model_assets
  for select to anon using (status = 'published');
drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings
  for select to anon using (is_public);

drop policy if exists booking_settings_staff_all on public.booking_settings;
drop policy if exists booking_settings_admin_all on public.booking_settings;
create policy booking_settings_admin_all on public.booking_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists appointments_staff_all on public.appointments;
drop policy if exists appointments_admin_all on public.appointments;
create policy appointments_admin_all on public.appointments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists settings_staff_all on public.site_settings;
drop policy if exists settings_admin_all on public.site_settings;
create policy settings_admin_all on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists inquiries_staff_all on public.inquiries;
drop policy if exists inquiries_admin_all on public.inquiries;
create policy inquiries_admin_all on public.inquiries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop function if exists public.create_booking(date, time, text, text, text, text, text, text);
create or replace function public.create_booking(
  p_booking_date date,
  p_slot_start time,
  p_contact_name text,
  p_company text,
  p_email text,
  p_phone text,
  p_topic text,
  p_meeting_type text,
  p_meeting_duration_minutes integer,
  p_customer_timezone text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  cfg public.booking_settings%rowtype;
  v_today date;
  v_slot_end time;
  v_booked integer;
  v_id uuid;
begin
  select * into cfg from public.booking_settings where id = 1;
  if not found then
    raise exception using errcode = 'P0001', message = 'booking_not_configured';
  end if;

  if p_contact_name is null or char_length(trim(p_contact_name)) not between 2 and 120
     or p_email is null or char_length(trim(p_email)) not between 5 and 254
     or p_phone is null or char_length(trim(p_phone)) not between 5 and 50
     or p_company is null or char_length(p_company) > 160
     or p_topic is null or char_length(p_topic) > 2000
     or p_meeting_type not in ('video_call', 'factory_visit')
     or p_meeting_duration_minutes is null
     or not (p_meeting_duration_minutes = any(cfg.meeting_durations))
     or p_customer_timezone is null
     or not (cfg.timezones ? p_customer_timezone) then
    raise exception using errcode = '22023', message = 'invalid_booking_details';
  end if;

  if p_meeting_duration_minutes > cfg.slot_minutes then
    raise exception using errcode = 'P0001', message = 'duration_unavailable';
  end if;

  v_today := (now() at time zone cfg.timezone)::date;
  if p_booking_date < v_today or p_booking_date > v_today + cfg.advance_days
     or not (extract(isodow from p_booking_date)::smallint = any(cfg.working_days)) then
    raise exception using errcode = 'P0001', message = 'date_unavailable';
  end if;

  v_slot_end := p_slot_start + make_interval(mins => cfg.slot_minutes);
  if p_slot_start < cfg.start_time or v_slot_end > cfg.end_time
     or mod(extract(epoch from (p_slot_start - cfg.start_time))::integer, cfg.slot_minutes * 60) <> 0 then
    raise exception using errcode = 'P0001', message = 'slot_unavailable';
  end if;

  perform pg_advisory_xact_lock(hashtext('mewepak-booking'), hashtext(p_booking_date::text || p_slot_start::text));

  select count(*) into v_booked
  from public.appointments
  where booking_date = p_booking_date
    and slot_start = p_slot_start
    and status in ('pending', 'confirmed');

  if v_booked >= cfg.max_per_slot then
    raise exception using errcode = 'P0001', message = 'slot_full';
  end if;

  insert into public.appointments (
    booking_date, slot_start, slot_end, contact_name, company, email, phone, topic,
    meeting_type, meeting_duration_minutes, customer_timezone
  ) values (
    p_booking_date, p_slot_start, v_slot_end, trim(p_contact_name), trim(p_company),
    lower(trim(p_email)), trim(p_phone), trim(p_topic), p_meeting_type,
    p_meeting_duration_minutes, p_customer_timezone
  ) returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_booking(date, time, text, text, text, text, text, text, integer, text) from public, anon, authenticated;
grant execute on function public.create_booking(date, time, text, text, text, text, text, text, integer, text) to service_role;
