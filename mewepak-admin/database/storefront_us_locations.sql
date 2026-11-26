insert into public.site_settings (key, value, is_public) values (
  'us_locations',
  '{
    "address_1": "9933 Franklin Ave Franklin Park IL 60131",
    "address_2": "4225 Executive Square, Suite 600 LA Jolla, CA 92037",
    "address_3": "1000 Brickell Ave Ste 715 Miami, FL 33131",
    "toll_free": "1-800-396-1840",
    "front_desk": "630-364-3944"
  }'::jsonb,
  true
) on conflict (key) do nothing;
