-- Saint profiles: AI-generated, source-grounded profiles of the saint/feast of
-- the day, with a human-review backstop. Run this once on the Prayer Warrior
-- Supabase project (SQL Editor, or `supabase db push`).
--
-- Accuracy workflow:
--   * The app generates a profile with Gemini (grounded in Catholic sources)
--     and upserts it here via upsert_saint_profile().
--   * To correct an entry, edit its row in the dashboard and set verified = true.
--   * Verified rows are never overwritten by future AI regenerations.

create table if not exists public.saint_profiles (
  slug             text primary key,
  name             text not null,
  feast_day        text,
  canonization     text,
  history          text,
  contributions    text,
  patronage        text,
  feast_engagement text,
  summary          text,
  sources          jsonb not null default '[]'::jsonb,
  verified         boolean not null default false,
  generated_at     timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.saint_profiles enable row level security;

-- Public read (the profiles are not user data; everyone sees the same saint).
drop policy if exists "saint_profiles read" on public.saint_profiles;
create policy "saint_profiles read"
  on public.saint_profiles for select
  to anon, authenticated
  using (true);

-- Writes go only through the SECURITY DEFINER function below — no direct
-- insert/update/delete policies, so the anon key cannot tamper with rows.

create or replace function public.upsert_saint_profile(
  p_slug             text,
  p_name             text,
  p_feast_day        text,
  p_canonization     text,
  p_history          text,
  p_contributions    text,
  p_patronage        text,
  p_feast_engagement text,
  p_summary          text,
  p_sources          jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.saint_profiles as s (
    slug, name, feast_day, canonization, history, contributions,
    patronage, feast_engagement, summary, sources, generated_at, updated_at
  ) values (
    p_slug, p_name, p_feast_day, p_canonization, p_history, p_contributions,
    p_patronage, p_feast_engagement, p_summary, coalesce(p_sources, '[]'::jsonb), now(), now()
  )
  on conflict (slug) do update set
    name             = excluded.name,
    feast_day        = excluded.feast_day,
    canonization     = excluded.canonization,
    history          = excluded.history,
    contributions    = excluded.contributions,
    patronage        = excluded.patronage,
    feast_engagement = excluded.feast_engagement,
    summary          = excluded.summary,
    sources          = excluded.sources,
    updated_at       = now()
  -- Never clobber an entry a human has reviewed and corrected.
  where s.verified = false;
end;
$$;

grant execute on function public.upsert_saint_profile(
  text, text, text, text, text, text, text, text, text, jsonb
) to anon, authenticated;
