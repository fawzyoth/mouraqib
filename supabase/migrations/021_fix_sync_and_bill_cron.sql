-- Drop the broken sync-and-bill cron job if it exists, then re-create with hardcoded values
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'sync-and-bill';

SELECT cron.schedule(
  'sync-and-bill',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url    := 'https://jjnzmdanmkhzdpwljtgw.supabase.co/functions/v1/sync-and-bill',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbnptZGFubWtoemRwd2xqdGd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTIyNzE1MiwiZXhwIjoyMDg2ODAzMTUyfQ.R54xi0a3VQ0QZ0G0ojN9hKClzbIKwqTFxuwGkKqEhnw", "Content-Type": "application/json"}'::jsonb,
    body   := '{}'::jsonb
  );
  $$
);
