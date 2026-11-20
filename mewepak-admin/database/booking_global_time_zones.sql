with zones as (
  select '{
    "UTC": "Coordinated Universal Time",
    "America/Los_Angeles": "Los Angeles",
    "America/Denver": "Denver",
    "America/Chicago": "Chicago",
    "America/New_York": "New York",
    "America/Mexico_City": "Mexico City",
    "America/Sao_Paulo": "São Paulo",
    "Europe/London": "London",
    "Europe/Paris": "Paris",
    "Africa/Johannesburg": "Johannesburg",
    "Asia/Dubai": "Dubai",
    "Asia/Kolkata": "India",
    "Asia/Bangkok": "Bangkok",
    "Asia/Singapore": "Singapore",
    "Asia/Shanghai": "China",
    "Asia/Tokyo": "Tokyo",
    "Australia/Sydney": "Sydney",
    "Pacific/Auckland": "Auckland"
  }'::jsonb as options
)
update public.booking_settings as settings
set timezones = zones.options
from zones
where settings.id = 1
  and settings.timezones is distinct from zones.options;
