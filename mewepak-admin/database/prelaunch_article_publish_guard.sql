-- Prelaunch article publishing guard.
-- Keep scheduled/future articles out of anonymous storefront reads and ensure
-- a published article always has a publish timestamp.

drop policy if exists articles_public_read on public.articles;
create policy articles_public_read
on public.articles
for select
to anon
using (
  status = 'published'
  and published_at is not null
  and published_at <= now()
);

create or replace function public.ensure_article_published_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_articles_published_at on public.articles;
create trigger trg_articles_published_at
before insert or update of status, published_at on public.articles
for each row execute function public.ensure_article_published_at();
