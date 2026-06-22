-- Durable TTS audio cache bucket.
--
-- Synthesised prayer audio is stored here once and served forever, so repeated
-- prayers never re-spend ElevenLabs/Google credits (even across deploys). The
-- app writes with the service-role key (which bypasses RLS); the bucket is
-- public-read so cached clips can also be served directly if ever desired.
--
-- Run once on the Prayer Warrior Supabase project.

insert into storage.buckets (id, name, public)
values ('tts-cache', 'tts-cache', true)
on conflict (id) do nothing;

-- Public read of cached audio objects (server reads use the service role and
-- don't rely on this, but it lets the audio be fetched by URL if needed).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'tts_cache_public_read'
  ) then
    create policy "tts_cache_public_read" on storage.objects
      for select using (bucket_id = 'tts-cache');
  end if;
end $$;
