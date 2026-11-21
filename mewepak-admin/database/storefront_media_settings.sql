insert into public.site_settings (key, value, is_public) values
  ('factory_tour', '{"video_url":"","poster_url":""}'::jsonb, true),
  ('languages', '{"links":[]}'::jsonb, true)
on conflict (key) do nothing;

update storage.buckets
set allowed_mime_types = array(
  select distinct mime
  from unnest(allowed_mime_types || array['video/mp4','video/webm','model/gltf+json']) as mime
  order by mime
)
where id = 'site-media' and allowed_mime_types is not null;
