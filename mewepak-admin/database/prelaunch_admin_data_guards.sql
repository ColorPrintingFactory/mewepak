-- Prelaunch data-integrity and admin-management guards.
-- Safe to re-run.

alter table public.inquiries
  add column if not exists source_page text not null default '',
  add column if not exists internal_notes text not null default '';

alter table public.product_categories drop constraint if exists product_categories_slug_format;
alter table public.product_categories add constraint product_categories_slug_format
check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

alter table public.products drop constraint if exists products_slug_format;
alter table public.products add constraint products_slug_format
check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

alter table public.articles drop constraint if exists articles_slug_format;
alter table public.articles add constraint articles_slug_format
check (
  slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  and slug <> all(array[
    'admin','api','assets','search','contact','products','markets','solutions',
    'blog','about-us','added-value','sustainability','booking','inquiry'
  ])
);

create or replace function public.guard_product_category_integrity()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  category_status text;
begin
  if new.status = 'published' then
    if new.category_id is null then
      raise exception using errcode='23514', message='published_product_requires_category';
    end if;
    select status into category_status from public.product_categories where id = new.category_id;
    if category_status is distinct from 'published' then
      raise exception using errcode='23514', message='published_product_requires_published_category';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_products_category_integrity on public.products;
create trigger trg_products_category_integrity
before insert or update of category_id,status on public.products
for each row execute function public.guard_product_category_integrity();

create or replace function public.guard_category_delete()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if exists(select 1 from public.products where category_id = old.id) then
    raise exception using errcode='23503', message='category_has_products';
  end if;
  return old;
end;
$$;

drop trigger if exists trg_category_delete_guard on public.product_categories;
create trigger trg_category_delete_guard
before delete on public.product_categories
for each row execute function public.guard_category_delete();

create or replace function public.normalize_model_asset_urls()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.model_url := nullif(trim(coalesce(new.model_url,'')), '');
  new.poster_url := nullif(trim(coalesce(new.poster_url,'')), '');
  if new.model_url is not null and new.model_url !~* '^(https://|/).*\.(glb|gltf)([?#].*)?$' then
    raise exception using errcode='23514', message='invalid_model_url';
  end if;
  if new.poster_url is not null and new.poster_url !~* '^(https://|/).*\.(png|jpe?g|webp|avif)([?#].*)?$' then
    raise exception using errcode='23514', message='invalid_model_poster_url';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_model_asset_urls on public.model_assets;
create trigger trg_model_asset_urls
before insert or update of model_url,poster_url on public.model_assets
for each row execute function public.normalize_model_asset_urls();
