-- CyberGuard database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "uuid-ossp";

-- ============ PROFILES ============
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  points integer not null default 0,
  level integer not null default 1,
  awareness_score integer not null default 0,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now()
);

-- ============ MODULES (courses) ============
create table modules (
  id uuid primary key default uuid_generate_v4(),
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

-- ============ LESSONS ============
create table lessons (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  content jsonb not null default '[]', -- array of content blocks: {type, data}
  order_index integer not null default 0,
  video_url text,
  created_at timestamptz not null default now()
);

-- ============ QUIZZES ============
create table quizzes (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid references modules(id) on delete cascade,
  title text not null,
  category text not null,
  difficulty text not null default 'beginner',
  time_limit_seconds integer,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
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

create table quiz_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  quiz_id uuid not null references quizzes(id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  answers jsonb not null default '{}',
  completed_at timestamptz not null default now()
);

-- ============ SIMULATIONS ============
create table simulations (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  category text not null, -- wifi | phishing | social_engineering | ransomware | ...
  description text not null,
  scenario text not null,
  difficulty text not null default 'beginner',
  duration_minutes integer not null default 10,
  learning_objective text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table simulation_steps (
  id uuid primary key default uuid_generate_v4(),
  simulation_id uuid not null references simulations(id) on delete cascade,
  order_index integer not null default 0,
  prompt text not null,
  options jsonb not null default '[]', -- [{id, label, correct, feedback}]
  explanation text
);

create table simulation_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  simulation_id uuid not null references simulations(id) on delete cascade,
  score integer not null,
  answers jsonb not null default '{}',
  completed_at timestamptz not null default now()
);

-- ============ ASSESSMENT ============
create table assessments (
  id uuid primary key default uuid_generate_v4(),
  title text not null default 'Cybersecurity Awareness Assessment',
  description text
);

create table assessment_questions (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  topic text not null,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null check (correct_answer in ('a', 'b', 'c', 'd')),
  order_index integer not null default 0
);

create table assessment_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  assessment_id uuid not null references assessments(id) on delete cascade,
  score integer not null,
  band text not null, -- beginner | basic | good | excellent
  completed_at timestamptz not null default now()
);

-- ============ PROGRESS ============
create table progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  module_id uuid not null references modules(id) on delete cascade,
  completed_lessons uuid[] not null default '{}',
  is_completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

-- ============ GAMIFICATION ============
create table badges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  icon text not null default 'ti-shield',
  requirement_type text not null, -- e.g. 'simulation_count', 'quiz_pass', 'module_complete'
  requirement_value integer not null default 1,
  requirement_meta jsonb default '{}'
);

create table user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- ============ CERTIFICATES ============
create table certificates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  certificate_code text unique not null,
  score integer not null,
  issued_at timestamptz not null default now()
);

-- ============ ACTIVITY LOG ============
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  action text not null, -- 'lesson_completed', 'quiz_passed', 'simulation_completed', 'badge_earned'
  meta jsonb default '{}',
  points_earned integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============ INDEXES ============
create index idx_lessons_module on lessons(module_id);
create index idx_questions_quiz on questions(quiz_id);
create index idx_simulation_steps_sim on simulation_steps(simulation_id);
create index idx_progress_user on progress(user_id);
create index idx_activity_user on activity_logs(user_id);

-- ============ ROW LEVEL SECURITY ============
alter table profiles enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table quizzes enable row level security;
alter table questions enable row level security;
alter table quiz_results enable row level security;
alter table simulations enable row level security;
alter table simulation_steps enable row level security;
alter table simulation_results enable row level security;
alter table assessments enable row level security;
alter table assessment_questions enable row level security;
alter table assessment_results enable row level security;
alter table progress enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;
alter table certificates enable row level security;
alter table activity_logs enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Profiles: users read/update themselves; admins read/update all
create policy "profiles_select_own_or_admin" on profiles for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_update_admin" on profiles for update using (is_admin());
create policy "profiles_insert_self" on profiles for insert with check (auth.uid() = id);

-- Published content: public read; admin full write
create policy "modules_read_published" on modules for select using (is_published = true or is_admin());
create policy "modules_admin_write" on modules for all using (is_admin()) with check (is_admin());

create policy "lessons_read" on lessons for select using (
  exists (select 1 from modules m where m.id = module_id and (m.is_published or is_admin()))
);
create policy "lessons_admin_write" on lessons for all using (is_admin()) with check (is_admin());

create policy "quizzes_read_published" on quizzes for select using (is_published = true or is_admin());
create policy "quizzes_admin_write" on quizzes for all using (is_admin()) with check (is_admin());

create policy "questions_read" on questions for select using (
  exists (select 1 from quizzes q where q.id = quiz_id and (q.is_published or is_admin()))
);
create policy "questions_admin_write" on questions for all using (is_admin()) with check (is_admin());

create policy "simulations_read_published" on simulations for select using (is_published = true or is_admin());
create policy "simulations_admin_write" on simulations for all using (is_admin()) with check (is_admin());

create policy "sim_steps_read" on simulation_steps for select using (
  exists (select 1 from simulations s where s.id = simulation_id and (s.is_published or is_admin()))
);
create policy "sim_steps_admin_write" on simulation_steps for all using (is_admin()) with check (is_admin());

create policy "assessments_read" on assessments for select using (true);
create policy "assessment_questions_read" on assessment_questions for select using (true);
create policy "assessments_admin_write" on assessments for all using (is_admin()) with check (is_admin());
create policy "assessment_questions_admin_write" on assessment_questions for all using (is_admin()) with check (is_admin());

create policy "badges_read" on badges for select using (true);
create policy "badges_admin_write" on badges for all using (is_admin()) with check (is_admin());

-- User-owned result tables: users see/insert their own; admins see all
create policy "quiz_results_own" on quiz_results for select using (auth.uid() = user_id or is_admin());
create policy "quiz_results_insert_own" on quiz_results for insert with check (auth.uid() = user_id);

create policy "sim_results_own" on simulation_results for select using (auth.uid() = user_id or is_admin());
create policy "sim_results_insert_own" on simulation_results for insert with check (auth.uid() = user_id);

create policy "assessment_results_own" on assessment_results for select using (auth.uid() = user_id or is_admin());
create policy "assessment_results_insert_own" on assessment_results for insert with check (auth.uid() = user_id);

create policy "progress_own" on progress for select using (auth.uid() = user_id or is_admin());
create policy "progress_upsert_own" on progress for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on progress for update using (auth.uid() = user_id);

create policy "user_badges_own" on user_badges for select using (auth.uid() = user_id or is_admin());
create policy "user_badges_insert_own" on user_badges for insert with check (auth.uid() = user_id);

create policy "certificates_own" on certificates for select using (auth.uid() = user_id or is_admin());
create policy "certificates_insert_own" on certificates for insert with check (auth.uid() = user_id);

create policy "activity_own" on activity_logs for select using (auth.uid() = user_id or is_admin());
create policy "activity_insert_own" on activity_logs for insert with check (auth.uid() = user_id);

-- Leaderboard: allow reading limited profile fields publicly via a view
create view leaderboard as
  select id, full_name, avatar_url, points, level
  from profiles
  where status = 'active'
  order by points desc;

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public) values
  ('module-images', 'module-images', true),
  ('lesson-images', 'lesson-images', true),
  ('profile-images', 'profile-images', true),
  ('certificates', 'certificates', true)
on conflict (id) do nothing;

create policy "public_read_module_images" on storage.objects for select using (bucket_id = 'module-images');
create policy "public_read_lesson_images" on storage.objects for select using (bucket_id = 'lesson-images');
create policy "public_read_profile_images" on storage.objects for select using (bucket_id = 'profile-images');
create policy "public_read_certificates" on storage.objects for select using (bucket_id = 'certificates');

create policy "admin_write_module_images" on storage.objects for insert with check (bucket_id = 'module-images' and is_admin());
create policy "admin_write_lesson_images" on storage.objects for insert with check (bucket_id = 'lesson-images' and is_admin());
create policy "user_write_own_profile_image" on storage.objects for insert with check (bucket_id = 'profile-images' and auth.uid() is not null);

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'New user'), new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();