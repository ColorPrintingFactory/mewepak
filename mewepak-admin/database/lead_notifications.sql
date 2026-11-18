begin;

create table if not exists public.lead_notifications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null,
  kind text not null check (kind in ('booking_staff', 'booking_customer', 'booking_confirmed', 'quote_staff', 'quote_customer')),
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  next_attempt_at timestamptz not null default now(),
  claim_token uuid,
  sent_at timestamptz,
  last_error text,
  unique (lead_id, kind)
);

alter table public.lead_notifications enable row level security;
revoke all on public.lead_notifications from public, anon, authenticated;
grant select on public.lead_notifications to authenticated;
drop policy if exists lead_notifications_admin_read on public.lead_notifications;
create policy lead_notifications_admin_read on public.lead_notifications for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.enqueue_lead_notification()
returns trigger
language plpgsql security definer set search_path = pg_catalog, public
as $$
begin
  if tg_table_name = 'inquiries' then
    insert into public.lead_notifications (lead_id, kind)
      values (new.id, 'quote_staff'), (new.id, 'quote_customer') on conflict do nothing;
  elsif tg_op = 'INSERT' then
    insert into public.lead_notifications (lead_id, kind)
      values (new.id, 'booking_staff'), (new.id, 'booking_customer') on conflict do nothing;
  elsif new.status = 'confirmed' and old.status is distinct from new.status then
    insert into public.lead_notifications (lead_id, kind)
      values (new.id, 'booking_confirmed') on conflict do nothing;
  end if;
  return new;
end
$$;

revoke all on function public.enqueue_lead_notification() from public, anon, authenticated;
drop trigger if exists queue_booking_notifications on public.appointments;
create trigger queue_booking_notifications after insert or update of status on public.appointments
  for each row execute function public.enqueue_lead_notification();
drop trigger if exists queue_quote_notifications on public.inquiries;
create trigger queue_quote_notifications after insert on public.inquiries
  for each row execute function public.enqueue_lead_notification();

create or replace function public.claim_lead_notifications(p_secret text)
returns table (id uuid, claim_token uuid, kind text, email text, lead jsonb)
language plpgsql security definer set search_path = pg_catalog, public, extensions
as $$
begin
  if not exists (select 1 from public.site_settings
    where key = 'booking_api_secret' and value ->> 'sha256' = encode(digest(coalesce(p_secret, ''), 'sha256'), 'hex'))
  then raise exception using errcode = '42501', message = 'notification_gateway_denied'; end if;

  return query
  with next_jobs as (
    select n.id from public.lead_notifications n
    where n.sent_at is null and n.attempts < 8 and n.next_attempt_at <= now()
      and (n.kind not like '%_staff' or exists (
        select 1 from public.booking_settings s where s.id = 1 and nullif(trim(s.notification_email), '') is not null
      ))
      and (n.attempts = 0 or n.created_at > now() - interval '23 hours')
    order by n.next_attempt_at, n.id limit 12 for update skip locked
  ), claimed as (
    update public.lead_notifications n
    set attempts = n.attempts + 1, claim_token = gen_random_uuid(),
      next_attempt_at = now() + make_interval(mins => least(60, 2 ^ (n.attempts + 2)::integer)::integer)
    from next_jobs j where n.id = j.id returning n.*
  )
  select n.id, n.claim_token, n.kind,
    case when n.kind like '%_staff' then (select s.notification_email from public.booking_settings s where s.id = 1)
      else coalesce(a.email, i.email) end,
    case when a.id is not null then jsonb_build_object(
      'name', a.contact_name, 'company', a.company, 'date', a.booking_date,
      'time', to_char(a.slot_start, 'HH24:MI'), 'timezone', (select s.timezone from public.booking_settings s where s.id = 1),
      'type', a.meeting_type, 'status', a.status
    ) when i.id is not null then jsonb_build_object(
      'name', i.contact_name, 'company', i.company, 'type', i.product_type
    ) end
  from claimed n
  left join public.appointments a on n.kind like 'booking_%' and a.id = n.lead_id
  left join public.inquiries i on n.kind like 'quote_%' and i.id = n.lead_id;
end
$$;

create or replace function public.finish_lead_notification(p_secret text, p_id uuid, p_claim uuid, p_result text)
returns void
language plpgsql security definer set search_path = pg_catalog, public, extensions
as $$
begin
  if not exists (select 1 from public.site_settings
    where key = 'booking_api_secret' and value ->> 'sha256' = encode(digest(coalesce(p_secret, ''), 'sha256'), 'hex'))
  then raise exception using errcode = '42501', message = 'notification_gateway_denied'; end if;
  update public.lead_notifications
    set sent_at = case when p_result = 'sent' then now() else null end,
      last_error = case when p_result = 'sent' then null else left(p_result, 80) end,
      attempts = case when p_result = 'skipped' then 8 else attempts end,
      claim_token = null
    where id = p_id and claim_token = p_claim and sent_at is null;
end
$$;

revoke all on function public.claim_lead_notifications(text), public.finish_lead_notification(text, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.claim_lead_notifications(text), public.finish_lead_notification(text, uuid, uuid, text) to anon;

commit;
