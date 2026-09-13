-- Prayer logs: the community counter on the Today page ("N prayers offered,
-- N minutes in prayer"). Run this once on the Prayer Warrior Supabase project
-- (SQL Editor, or `supabase db push`).
--
-- The app has been writing to public.prayer_logs and reading
-- community_stats_all_time() since the counter shipped, but neither existed —
-- so every insert failed and the card showed a confident 0. This creates both.
--
-- Privacy: a row records that *a* prayer happened and for how long, not who
-- prayed it. user_id is null for anonymous users (most of them), and no policy
-- grants select — the anon key can add to the count but can never read the
-- rows back. The totals come out only through the aggregate function below.

create table if not exists public.prayer_logs (
  id               bigint generated always as identity primary key,
  user_id          uuid references auth.users(id) on delete set null,
  prayer_type      text not null,
  prayer_name      text,
  -- 1 when this row represents a distinct prayer, 0 when it only adds listening
  -- time to a prayer already counted in this sitting.
  segments_count   integer not null default 1,
  duration_seconds integer,
  created_at       timestamptz not null default now()
);

create index if not exists prayer_logs_created_at_idx on public.prayer_logs (created_at desc);

alter table public.prayer_logs enable row level security;

-- Anyone may add to the count, including signed-out users: praying does not
-- require an account. Rows carry no personal content.
drop policy if exists "prayer_logs insert" on public.prayer_logs;
create policy "prayer_logs insert"
  on public.prayer_logs for insert
  to anon, authenticated
  with check (
    -- A signed-in client may only log as itself; anonymous rows carry no user.
    (user_id is null or user_id = auth.uid())
    and segments_count between 0 and 1
    -- A sitting longer than 6h is a stuck timer, not prayer.
    and (duration_seconds is null or duration_seconds between 0 and 21600)
  );

-- No select / update / delete policies: the anon key cannot read, change, or
-- remove anything. Totals are served by the SECURITY DEFINER function below.

create or replace function public.community_stats_all_time()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'prayers', coalesce(sum(segments_count), 0),
    'minutes', coalesce(round(sum(duration_seconds) / 60.0), 0),
    'users',   count(distinct user_id)
  )
  from public.prayer_logs;
$$;

grant execute on function public.community_stats_all_time() to anon, authenticated;
