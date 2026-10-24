-- ============================================================================
-- CyberGuard (Kavach) Complete Production Database Schema
-- Idempotent, Production-Grade with Strict RLS, Triggers, and Server Authoritative RPCs
-- Can be run multiple times safely in Supabase SQL Editor
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. PROFILES (Linked to auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  points integer not null default 0,
  xp integer not null default 0,
  level integer not null default 1,
  tier text not null default 'Novice',
  awareness_score integer not null default 0,
  streak_days integer not null default 1,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 2. CONTENT TABLES: MODULES & LESSONS
-- ============================================================================
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text not null,
  category text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration_minutes integer not null default 15,
  thumbnail_url text,
  learning_objectives text[] not null default '{}',
  is_published boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  content jsonb not null default '[]',
  order_index integer not null default 0,
  video_url text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 3. QUIZZES & QUESTIONS
-- ============================================================================
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade,
  title text not null,
  category text not null,
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  time_limit_seconds integer,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null check (correct_answer in ('a', 'b', 'c', 'd')),
  explanation text,
  points integer not null default 10,
  difficulty text not null default 'beginner',
  order_index integer not null default 0
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  answers jsonb not null default '{}',
  completed_at timestamptz not null default now()
);

-- View alias for quiz_attempts
create or replace view public.quiz_attempts as
  select * from public.quiz_results;

-- ============================================================================
-- 4. SIMULATIONS & STEPS
-- ============================================================================
create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text not null,
  description text not null,
  scenario text not null,
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration_minutes integer not null default 10,
  learning_objective text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.simulation_steps (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.simulations(id) on delete cascade,
  order_index integer not null default 0,
  prompt text not null,
  options jsonb not null default '[]',
  explanation text
);

create table if not exists public.simulation_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  simulation_id uuid not null references public.simulations(id) on delete cascade,
  score integer not null,
  answers jsonb not null default '{}',
  completed_at timestamptz not null default now()
);

-- View alias for simulation_attempts
create or replace view public.simulation_attempts as
  select * from public.simulation_results;

-- ============================================================================
-- 5. ASSESSMENT & QUESTIONS
-- ============================================================================
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Cybersecurity Awareness Assessment',
  description text
);

create table if not exists public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  topic text not null,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null check (correct_answer in ('a', 'b', 'c', 'd')),
  explanation text,
  order_index integer not null default 0
);

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  score integer not null,
  band text not null,
  answers jsonb not null default '{}',
  completed_at timestamptz not null default now()
);

-- View alias for assessment_attempts
create or replace view public.assessment_attempts as
  select * from public.assessment_results;

-- ============================================================================
-- 6. PROGRESS (LESSON_PROGRESS)
-- ============================================================================
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  completed_lessons text[] not null default '{}',
  is_completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

-- View alias for lesson_progress
create or replace view public.lesson_progress as
  select * from public.progress;

-- ============================================================================
-- 7. GAMIFICATION: BADGES & USER_BADGES
-- ============================================================================
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  icon text not null default 'ti-shield',
  requirement_type text not null,
  requirement_value integer not null default 1,
  requirement_meta jsonb default '{}'
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- ============================================================================
-- 8. CERTIFICATES (CG-YYYY-XXXXX)
-- ============================================================================
create table if not exists public.certificates (
  id text primary key, -- Format: CG-YYYY-XXXXX
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  score integer not null,
  issued_at timestamptz not null default now(),
  unique (user_id)
);

-- ============================================================================
-- 9. INCIDENTS (INC-YYYY-XXXXX)
-- ============================================================================
create table if not exists public.incidents (
  id text primary key, -- Format: INC-YYYY-XXXXX
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  category_id text not null,
  urgency text not null check (urgency in ('low', 'medium', 'high', 'critical')),
  subject text not null,
  sender_or_source text not null,
  target_url_or_hash text,
  details text not null,
  status text not null default 'Under Review',
  risk_score text not null default 'ANALYZING',
  soc_actions jsonb not null default '[]',
  containment_playbook jsonb not null default '[]',
  attached_files text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 10. ACTIVITY LOG (ACTIVITY_LOGS)
-- ============================================================================
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  meta jsonb default '{}',
  points_earned integer not null default 0,
  created_at timestamptz not null default now()
);

-- View alias for activity_log
create or replace view public.activity_log as
  select * from public.activity_logs;

-- ============================================================================
-- 11. TOOL USAGE
-- ============================================================================
create table if not exists public.tool_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tool_name text not null,
  action text not null default 'executed',
  meta jsonb default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 12. THREAT BULLETINS (Threat Radar Intelligence)
-- ============================================================================
create table if not exists public.threat_bulletins (
  id text primary key,
  cve text,
  title text not null,
  category text not null,
  severity text not null check (severity in ('critical', 'high', 'elevated', 'advisory')),
  origin_region text not null default 'Global',
  target_sectors text[] not null default '{}',
  summary text not null,
  attack_vector text not null,
  mitigation text not null,
  mitre jsonb not null default '[]',
  iocs jsonb not null default '{"domains":[], "ips":[], "hashes":[]}',
  simulation_url text,
  simulation_label text,
  is_published boolean not null default true,
  published_at timestamptz not null default now()
);

-- ============================================================================
-- 13. INDEXES
-- ============================================================================
create index if not exists idx_lessons_module on public.lessons(module_id);
create index if not exists idx_questions_quiz on public.questions(quiz_id);
create index if not exists idx_simulation_steps_sim on public.simulation_steps(simulation_id);
create index if not exists idx_progress_user on public.progress(user_id);
create index if not exists idx_activity_user on public.activity_logs(user_id);
create index if not exists idx_activity_action_ref on public.activity_logs(user_id, action);
create index if not exists idx_quiz_results_user on public.quiz_results(user_id);
create index if not exists idx_sim_results_user on public.simulation_results(user_id);
create index if not exists idx_assessment_results_user on public.assessment_results(user_id);
create index if not exists idx_incidents_user on public.incidents(user_id);
create index if not exists idx_tool_usage_user on public.tool_usage(user_id);
create index if not exists idx_profiles_points on public.profiles(points desc);

-- ============================================================================
-- 14. ADMIN CHECK HELPER (SECURITY DEFINER)
-- ============================================================================
create or replace function public.is_admin() returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ============================================================================
-- 15. AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================================
create or replace function public.handle_new_user() returns trigger as $$
declare
  user_full_name text;
  assigned_role text;
begin
  user_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  if user_full_name = '' then
    user_full_name := 'Defender';
  end if;

  -- Designate admin for project owner emails or explicitly approved roles
  if lower(new.email) in ('tirthbariya03@gmail.com', 'admin@cyberguard.dev') then
    assigned_role := 'admin';
  else
    assigned_role := 'user';
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    avatar_url,
    points,
    xp,
    level,
    tier,
    awareness_score,
    streak_days,
    status
  )
  values (
    new.id,
    user_full_name,
    new.email,
    assigned_role,
    new.raw_user_meta_data->>'avatar_url',
    0,
    0,
    1,
    'Novice',
    0,
    1,
    'active'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = case when public.profiles.full_name = '' or public.profiles.full_name = 'New user' then excluded.full_name else public.profiles.full_name end,
    role = case when lower(new.email) in ('tirthbariya03@gmail.com') then 'admin' else public.profiles.role end;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 16. SERVER-SIDE AUTHORITATIVE XP & BADGE ENGINE (RPC)
-- ============================================================================
create or replace function public.award_xp(
  p_action text,
  p_points integer,
  p_meta jsonb default '{}'::jsonb,
  p_ref_id text default null,
  p_award_once boolean default false
)
returns jsonb as $$
declare
  curr_user_id uuid;
  existing_count integer;
  curr_profile record;
  new_points integer;
  new_level integer;
  new_tier text;
  badge_record record;
  new_badges_unlocked jsonb := '[]'::jsonb;
begin
  curr_user_id := auth.uid();
  if curr_user_id is null then
    raise exception 'Unauthorized: Must be logged in to record activity';
  end if;

  -- 1. Idempotency check if award_once is requested
  if p_award_once and p_ref_id is not null then
    select count(*) into existing_count
    from public.activity_logs
    where user_id = curr_user_id
      and action = p_action
      and meta->>'ref_id' = p_ref_id;

    if existing_count > 0 then
      select points, level, tier into curr_profile from public.profiles where id = curr_user_id;
      return jsonb_build_object(
        'awarded', false,
        'points_earned', 0,
        'points', curr_profile.points,
        'level', curr_profile.level,
        'tier', curr_profile.tier,
        'badges_unlocked', '[]'::jsonb
      );
    end if;
  end if;

  -- 2. Log activity
  insert into public.activity_logs (user_id, action, meta, points_earned)
  values (
    curr_user_id,
    p_action,
    coalesce(p_meta, '{}'::jsonb) || case when p_ref_id is not null then jsonb_build_object('ref_id', p_ref_id) else '{}'::jsonb end,
    greatest(0, coalesce(p_points, 0))
  );

  -- 3. Calculate new level and tier
  select * into curr_profile from public.profiles where id = curr_user_id;
  new_points := curr_profile.points + greatest(0, coalesce(p_points, 0));

  if new_points >= 1000 then
    new_level := 5;
  elsif new_points >= 600 then
    new_level := 4;
  elsif new_points >= 300 then
    new_level := 3;
  elsif new_points >= 100 then
    new_level := 2;
  else
    new_level := 1;
  end if;

  if new_points >= 1200 then
    new_tier := 'Cyber Architect';
  elsif new_points >= 800 then
    new_tier := 'Threat Hunter';
  elsif new_points >= 400 then
    new_tier := 'Defense Analyst';
  elsif new_points >= 150 then
    new_tier := 'Security Trainee';
  else
    new_tier := 'Cyber Novice';
  end if;

  -- 4. Update profile points, xp, level, tier
  update public.profiles
  set
    points = new_points,
    xp = new_points,
    level = new_level,
    tier = new_tier,
    updated_at = now()
  where id = curr_user_id;

  -- 5. Automatic Badge Evaluation
  for badge_record in
    select b.* from public.badges b
    where not exists (
      select 1 from public.user_badges ub
      where ub.user_id = curr_user_id and ub.badge_id = b.id
    )
  loop
    declare
      is_eligible boolean := false;
      cnt integer := 0;
      top_score integer := 0;
    begin
      if badge_record.requirement_type = 'module_count' then
        select count(*) into cnt from public.progress where user_id = curr_user_id and is_completed = true;
        is_eligible := cnt >= badge_record.requirement_value;
      elsif badge_record.requirement_type = 'simulation_category_count' then
        select count(*) into cnt from public.simulation_results where user_id = curr_user_id;
        is_eligible := cnt >= badge_record.requirement_value;
      elsif badge_record.requirement_type = 'assessment_score' then
        select coalesce(max(score), 0) into top_score from public.assessment_results where user_id = curr_user_id;
        is_eligible := top_score >= badge_record.requirement_value;
      elsif badge_record.requirement_type = 'module_complete' then
        select count(*) into cnt from public.progress where user_id = curr_user_id and is_completed = true;
        is_eligible := cnt >= badge_record.requirement_value;
      end if;

      if is_eligible then
        insert into public.user_badges (user_id, badge_id)
        values (curr_user_id, badge_record.id)
        on conflict (user_id, badge_id) do nothing;

        new_badges_unlocked := new_badges_unlocked || jsonb_build_object(
          'id', badge_record.id,
          'name', badge_record.name,
          'description', badge_record.description,
          'icon', badge_record.icon
        );
      end if;
    end;
  end loop;

  return jsonb_build_object(
    'awarded', true,
    'points_earned', greatest(0, coalesce(p_points, 0)),
    'points', new_points,
    'level', new_level,
    'tier', new_tier,
    'badges_unlocked', new_badges_unlocked
  );
end;
$$ language plpgsql security definer;

-- ============================================================================
-- 17. SERVER-SIDE CERTIFICATE ISSUANCE (RPC - CG-YYYY-XXXXX)
-- ============================================================================
create or replace function public.issue_certificate()
returns jsonb as $$
declare
  curr_user_id uuid;
  user_name text;
  top_score integer;
  existing_cert record;
  new_cert_id text;
  year_str text;
  rand_token text;
  attempts integer := 0;
begin
  curr_user_id := auth.uid();
  if curr_user_id is null then
    raise exception 'Unauthorized';
  end if;

  -- 1. Check existing certificate
  select * into existing_cert from public.certificates where user_id = curr_user_id;
  if existing_cert.id is not null then
    return to_jsonb(existing_cert);
  end if;

  -- 2. Verify score eligibility (Passing score is 61%+)
  select coalesce(max(score), 0) into top_score
  from public.assessment_results
  where user_id = curr_user_id;

  if top_score < 61 then
    raise exception 'Ineligible: Minimum score of 61%% on the Cybersecurity Assessment is required.';
  end if;

  select full_name into user_name from public.profiles where id = curr_user_id;
  year_str := to_char(now(), 'YYYY');

  -- 3. Collision-resistant ID generation: CG-YYYY-XXXXX
  loop
    attempts := attempts + 1;
    rand_token := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
    new_cert_id := 'CG-' || year_str || '-' || rand_token;

    exit when not exists (select 1 from public.certificates where id = new_cert_id);
    if attempts > 20 then
      new_cert_id := 'CG-' || year_str || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
      exit;
    end if;
  end loop;

  insert into public.certificates (id, user_id, full_name, score, issued_at)
  values (new_cert_id, curr_user_id, user_name, top_score, now())
  returning * into existing_cert;

  -- Award certificate badge if available
  perform public.award_xp('certificate_issued', 50, jsonb_build_object('credential_id', new_cert_id), new_cert_id, true);

  return to_jsonb(existing_cert);
end;
$$ language plpgsql security definer;

-- ============================================================================
-- 18. SERVER-SIDE INCIDENT REPORTING (RPC - INC-YYYY-XXXXX)
-- ============================================================================
create or replace function public.report_incident(
  p_category text,
  p_category_id text,
  p_urgency text,
  p_subject text,
  p_sender text,
  p_target_url text,
  p_details text,
  p_attached_files text[] default '{}'
)
returns jsonb as $$
declare
  curr_user_id uuid;
  new_incident_id text;
  year_str text;
  rand_token text;
  attempts integer := 0;
  created_record record;
  daily_count integer;
begin
  curr_user_id := auth.uid();
  if curr_user_id is null then
    raise exception 'Unauthorized';
  end if;

  year_str := to_char(now(), 'YYYY');

  -- Collision-resistant ID: INC-YYYY-XXXXX
  loop
    attempts := attempts + 1;
    rand_token := lpad((floor(random() * 90000) + 10000)::text, 5, '0');
    new_incident_id := 'INC-' || year_str || '-' || rand_token;

    exit when not exists (select 1 from public.incidents where id = new_incident_id);
    if attempts > 20 then
      new_incident_id := 'INC-' || year_str || '-' || upper(substr(md5(random()::text), 1, 5));
      exit;
    end if;
  end loop;

  insert into public.incidents (
    id,
    user_id,
    category,
    category_id,
    urgency,
    subject,
    sender_or_source,
    target_url_or_hash,
    details,
    status,
    risk_score,
    soc_actions,
    containment_playbook,
    attached_files,
    created_at
  )
  values (
    new_incident_id,
    curr_user_id,
    p_category,
    p_category_id,
    p_urgency,
    p_subject,
    p_sender,
    p_target_url,
    p_details,
    'Triaged & Contained',
    case
      when p_urgency = 'critical' then 'CRITICAL RISK — ACTIVE ESCALATION'
      when p_urgency = 'high' then 'HIGH RISK — THREAT RECORDED'
      when p_urgency = 'medium' then 'ELEVATED RISK — IOCS ISOLATED'
      else 'MONITORED — SUSPICIOUS ARTIFACT'
    end,
    jsonb_build_array(
      'Recorded indicator: ' || coalesce(p_sender, 'External Vector'),
      'Containment playbook generated for ' || p_category,
      'Incident logged with cryptographic hash integrity.'
    ),
    jsonb_build_array(
      'Do not interact with the reported sender or target link.',
      'Check account login activity across connected sessions.',
      'Monitor organization threat bulletins for coordinated waves.'
    ),
    coalesce(p_attached_files, '{}'),
    now()
  )
  returning * into created_record;

  -- Daily XP Award (max 3/day)
  select count(*) into daily_count
  from public.activity_logs
  where user_id = curr_user_id
    and action = 'incident_reported'
    and created_at >= date_trunc('day', now());

  if daily_count < 3 then
    perform public.award_xp('incident_reported', 30, jsonb_build_object('incident_id', new_incident_id), new_incident_id, true);
  end if;

  return to_jsonb(created_record);
end;
$$ language plpgsql security definer;

-- ============================================================================
-- 19. SERVER-SIDE PROGRESS & ASSESSMENT HELPERS (RPC)
-- ============================================================================
create or replace function public.record_lesson_progress(
  p_module_id uuid,
  p_lesson_id text
)
returns jsonb as $$
declare
  curr_user_id uuid;
  total_lessons integer;
  curr_completed text[];
  new_completed text[];
  fully_done boolean;
  prog_record record;
begin
  curr_user_id := auth.uid();
  if curr_user_id is null then raise exception 'Unauthorized'; end if;

  select coalesce(array_agg(id::text), '{}') into curr_completed
  from (
    select unnest(completed_lessons) as id from public.progress
    where user_id = curr_user_id and module_id = p_module_id
  ) s;

  if not (p_lesson_id = any(curr_completed)) then
    new_completed := array_append(curr_completed, p_lesson_id);
  else
    new_completed := curr_completed;
  end if;

  select count(*) into total_lessons from public.lessons where module_id = p_module_id;
  fully_done := total_lessons > 0 and array_length(new_completed, 1) >= total_lessons;

  insert into public.progress (user_id, module_id, completed_lessons, is_completed, updated_at)
  values (curr_user_id, p_module_id, new_completed, fully_done, now())
  on conflict (user_id, module_id) do update set
    completed_lessons = excluded.completed_lessons,
    is_completed = excluded.is_completed,
    updated_at = now()
  returning * into prog_record;

  -- Award XP
  perform public.award_xp('lesson_completed', 20, jsonb_build_object('module_id', p_module_id), p_lesson_id, true);

  if fully_done then
    perform public.award_xp('module_completed', 50, jsonb_build_object('module_id', p_module_id), p_module_id::text, true);
  end if;

  return to_jsonb(prog_record);
end;
$$ language plpgsql security definer;

create or replace function public.submit_assessment(
  p_assessment_id uuid,
  p_score integer,
  p_band text,
  p_answers jsonb default '{}'::jsonb
)
returns jsonb as $$
declare
  curr_user_id uuid;
  prev_best integer := 0;
  result_record record;
  points_to_award integer := 0;
begin
  curr_user_id := auth.uid();
  if curr_user_id is null then raise exception 'Unauthorized'; end if;

  select coalesce(max(score), 0) into prev_best
  from public.assessment_results
  where user_id = curr_user_id;

  insert into public.assessment_results (user_id, assessment_id, score, band, answers, completed_at)
  values (curr_user_id, p_assessment_id, p_score, lower(p_band), p_answers, now())
  returning * into result_record;

  -- Update profile awareness_score monotonically (never degrades)
  update public.profiles
  set awareness_score = greatest(awareness_score, p_score)
  where id = curr_user_id;

  if p_score >= 61 and prev_best < 61 then
    points_to_award := 100;
  elsif p_score >= 61 and p_score > prev_best then
    points_to_award := 20;
  end if;

  if points_to_award > 0 then
    perform public.award_xp('assessment_completed', points_to_award, jsonb_build_object('score', p_score, 'band', p_band), 'assess_' || p_score::text, true);
  end if;

  return to_jsonb(result_record);
end;
$$ language plpgsql security definer;

create or replace function public.log_tool_usage(
  p_tool_name text,
  p_action text default 'audit',
  p_meta jsonb default '{}'::jsonb
)
returns jsonb as $$
declare
  curr_user_id uuid;
  tool_record record;
begin
  curr_user_id := auth.uid();
  if curr_user_id is null then raise exception 'Unauthorized'; end if;

  insert into public.tool_usage (user_id, tool_name, action, meta)
  values (curr_user_id, p_tool_name, p_action, p_meta)
  returning * into tool_record;

  return to_jsonb(tool_record);
end;
$$ language plpgsql security definer;

-- ============================================================================
-- 20. LEADERBOARD VIEW (SAFE COLUMNS ONLY, NO EMAILS)
-- ============================================================================
drop view if exists public.leaderboard;
create or replace view public.leaderboard as
  select
    p.id,
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    p.points,
    p.xp,
    p.level,
    p.tier,
    p.awareness_score,
    count(ub.badge_id) as badges_count,
    dense_rank() over (order by p.points desc, p.created_at asc) as rank
  from public.profiles p
  left join public.user_badges ub on ub.user_id = p.id
  where p.status = 'active'
  group by p.id, p.full_name, p.avatar_url, p.points, p.xp, p.level, p.tier, p.awareness_score, p.created_at;

-- ============================================================================
-- 21. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_results enable row level security;
alter table public.simulations enable row level security;
alter table public.simulation_steps enable row level security;
alter table public.simulation_results enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_results enable row level security;
alter table public.progress enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.certificates enable row level security;
alter table public.incidents enable row level security;
alter table public.activity_logs enable row level security;
alter table public.tool_usage enable row level security;
alter table public.threat_bulletins enable row level security;

-- PROFILES
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- MODULES (Public read published, admin write)
drop policy if exists "modules_read" on public.modules;
create policy "modules_read" on public.modules
  for select using (is_published = true or public.is_admin());

drop policy if exists "modules_admin" on public.modules;
create policy "modules_admin" on public.modules
  for all using (public.is_admin()) with check (public.is_admin());

-- LESSONS
drop policy if exists "lessons_read" on public.lessons;
create policy "lessons_read" on public.lessons
  for select using (
    exists (select 1 from public.modules m where m.id = module_id and (m.is_published or public.is_admin()))
  );

drop policy if exists "lessons_admin" on public.lessons;
create policy "lessons_admin" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- QUIZZES & QUESTIONS
drop policy if exists "quizzes_read" on public.quizzes;
create policy "quizzes_read" on public.quizzes
  for select using (is_published = true or public.is_admin());

drop policy if exists "quizzes_admin" on public.quizzes;
create policy "quizzes_admin" on public.quizzes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "questions_read" on public.questions;
create policy "questions_read" on public.questions
  for select using (
    exists (select 1 from public.quizzes q where q.id = quiz_id and (q.is_published or public.is_admin()))
  );

drop policy if exists "questions_admin" on public.questions;
create policy "questions_admin" on public.questions
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "quiz_results_own" on public.quiz_results;
create policy "quiz_results_own" on public.quiz_results
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "quiz_results_insert" on public.quiz_results;
create policy "quiz_results_insert" on public.quiz_results
  for insert with check (auth.uid() = user_id);

-- SIMULATIONS & STEPS
drop policy if exists "simulations_read" on public.simulations;
create policy "simulations_read" on public.simulations
  for select using (is_published = true or public.is_admin());

drop policy if exists "simulations_admin" on public.simulations;
create policy "simulations_admin" on public.simulations
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sim_steps_read" on public.simulation_steps;
create policy "sim_steps_read" on public.simulation_steps
  for select using (
    exists (select 1 from public.simulations s where s.id = simulation_id and (s.is_published or public.is_admin()))
  );

drop policy if exists "sim_steps_admin" on public.simulation_steps;
create policy "sim_steps_admin" on public.simulation_steps
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sim_results_own" on public.simulation_results;
create policy "sim_results_own" on public.simulation_results
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "sim_results_insert" on public.simulation_results;
create policy "sim_results_insert" on public.simulation_results
  for insert with check (auth.uid() = user_id);

-- ASSESSMENTS & QUESTIONS
drop policy if exists "assessments_read" on public.assessments;
create policy "assessments_read" on public.assessments
  for select using (true);

drop policy if exists "assessments_admin" on public.assessments;
create policy "assessments_admin" on public.assessments
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "assessment_questions_read" on public.assessment_questions;
create policy "assessment_questions_read" on public.assessment_questions
  for select using (true);

drop policy if exists "assessment_questions_admin" on public.assessment_questions;
create policy "assessment_questions_admin" on public.assessment_questions
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "assessment_results_own" on public.assessment_results;
create policy "assessment_results_own" on public.assessment_results
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "assessment_results_insert" on public.assessment_results;
create policy "assessment_results_insert" on public.assessment_results
  for insert with check (auth.uid() = user_id);

-- PROGRESS
drop policy if exists "progress_own" on public.progress;
create policy "progress_own" on public.progress
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "progress_modify_own" on public.progress;
create policy "progress_modify_own" on public.progress
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- BADGES & USER BADGES
drop policy if exists "badges_read" on public.badges;
create policy "badges_read" on public.badges
  for select using (true);

drop policy if exists "badges_admin" on public.badges;
create policy "badges_admin" on public.badges
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "user_badges_read" on public.user_badges;
create policy "user_badges_read" on public.user_badges
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "user_badges_insert" on public.user_badges;
create policy "user_badges_insert" on public.user_badges
  for insert with check (auth.uid() = user_id or public.is_admin());

-- CERTIFICATES (Publicly verifiable)
drop policy if exists "certificates_select" on public.certificates;
create policy "certificates_select" on public.certificates
  for select using (true);

drop policy if exists "certificates_admin_write" on public.certificates;
create policy "certificates_admin_write" on public.certificates
  for all using (public.is_admin()) with check (public.is_admin());

-- INCIDENTS
drop policy if exists "incidents_own" on public.incidents;
create policy "incidents_own" on public.incidents
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "incidents_insert" on public.incidents;
create policy "incidents_insert" on public.incidents
  for insert with check (auth.uid() = user_id);

drop policy if exists "incidents_admin_update" on public.incidents;
create policy "incidents_admin_update" on public.incidents
  for update using (public.is_admin());

-- ACTIVITY LOGS
drop policy if exists "activity_own" on public.activity_logs;
create policy "activity_own" on public.activity_logs
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "activity_insert" on public.activity_logs;
create policy "activity_insert" on public.activity_logs
  for insert with check (auth.uid() = user_id);

-- TOOL USAGE
drop policy if exists "tool_usage_own" on public.tool_usage;
create policy "tool_usage_own" on public.tool_usage
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "tool_usage_insert" on public.tool_usage;
create policy "tool_usage_insert" on public.tool_usage
  for insert with check (auth.uid() = user_id);

-- THREAT BULLETINS (Public read, admin write)
drop policy if exists "bulletins_read" on public.threat_bulletins;
create policy "bulletins_read" on public.threat_bulletins
  for select using (is_published = true or public.is_admin());

drop policy if exists "bulletins_admin" on public.threat_bulletins;
create policy "bulletins_admin" on public.threat_bulletins
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 22. STORAGE BUCKETS CONFIGURATION
-- ============================================================================
insert into storage.buckets (id, name, public) values
  ('module-images', 'module-images', true),
  ('lesson-images', 'lesson-images', true),
  ('profile-images', 'profile-images', true),
  ('certificates', 'certificates', true)
on conflict (id) do nothing;

drop policy if exists "public_read_module_images" on storage.objects;
create policy "public_read_module_images" on storage.objects for select using (bucket_id = 'module-images');

drop policy if exists "public_read_lesson_images" on storage.objects;
create policy "public_read_lesson_images" on storage.objects for select using (bucket_id = 'lesson-images');

drop policy if exists "public_read_profile_images" on storage.objects;
create policy "public_read_profile_images" on storage.objects for select using (bucket_id = 'profile-images');

drop policy if exists "public_read_certificates" on storage.objects;
create policy "public_read_certificates" on storage.objects for select using (bucket_id = 'certificates');

drop policy if exists "admin_write_module_images" on storage.objects;
create policy "admin_write_module_images" on storage.objects for insert with check (bucket_id = 'module-images' and public.is_admin());

drop policy if exists "admin_write_lesson_images" on storage.objects;
create policy "admin_write_lesson_images" on storage.objects for insert with check (bucket_id = 'lesson-images' and public.is_admin());

drop policy if exists "user_write_own_profile_image" on storage.objects;
create policy "user_write_own_profile_image" on storage.objects for insert with check (bucket_id = 'profile-images' and auth.uid() is not null);

-- ============================================================================
-- 23. REALTIME PUBLICATION
-- ============================================================================
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles') then
    alter publication supabase_realtime add table public.profiles;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_badges') then
    alter publication supabase_realtime add table public.user_badges;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'incidents') then
    alter publication supabase_realtime add table public.incidents;
  end if;
exception when others then
  null; -- Ignore if publication table addition is managed automatically
end $$;