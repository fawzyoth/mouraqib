-- Replace the cron job with hardcoded URL and key
-- (ALTER DATABASE SET is restricted on Supabase hosted, so we inline the values)
SELECT cron.unschedule('poll-carrier-status');

SELECT cron.schedule(
  'poll-carrier-status',
  '* * * * *',
  $$
  SELECT net.http_post(
    url    := 'https://jjnzmdanmkhzdpwljtgw.supabase.co/functions/v1/poll-carrier-status',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbnptZGFubWtoemRwd2xqdGd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTIyNzE1MiwiZXhwIjoyMDg2ODAzMTUyfQ.R54xi0a3VQ0QZ0G0ojN9hKClzbIKwqTFxuwGkKqEhnw", "Content-Type": "application/json"}'::jsonb,
    body   := '{}'::jsonb
  );
  $$
);
