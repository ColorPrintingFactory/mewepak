alter table public.inquiries
  add column if not exists product_type text not null default '',
  add column if not exists quantity text not null default '',
  add column if not exists product_context text not null default '';

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(btrim(email)) and length(email) <= 254),
  source_page text not null default '/',
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from anon, authenticated;
grant select, delete on public.newsletter_subscribers to authenticated;
grant select, insert on public.newsletter_subscribers to service_role;

drop policy if exists newsletter_admin_read on public.newsletter_subscribers;
create policy newsletter_admin_read on public.newsletter_subscribers
  for select to authenticated using ((select public.is_admin()));

drop policy if exists newsletter_admin_delete on public.newsletter_subscribers;
create policy newsletter_admin_delete on public.newsletter_subscribers
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists storefront_private_gateway_hash on public.site_settings;
create policy storefront_private_gateway_hash on public.site_settings
  as restrictive for select to anon using (key <> 'booking_api_secret');
