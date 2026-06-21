-- FitForge Supabase Backend Schema Definition

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS Table (extends auth.users with app-specific profile parameters)
create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  name text,
  age int,
  weight_kg numeric,
  height_cm numeric,
  fitness_goal text check (fitness_goal in ('bulk', 'cut', 'maintain', 'general')),
  daily_calories int,
  daily_protein_g int,
  daily_carbs_g int,
  daily_fats_g int,
  created_at timestamptz default now()
);

-- EXERCISE LIBRARY (shared catalogs, never duplicated per routine/user)
create table if not exists public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_muscle text,
  equipment text,
  gif_url text,
  is_custom boolean default false,
  created_by uuid references public.users(id) on delete set null
);

-- ROUTINES Table
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  routine_name text not null,
  is_ai_generated boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ROUTINE EXERCISES Join Table
create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid references public.routines(id) on delete cascade not null,
  exercise_id uuid references public.exercise_library(id) on delete cascade not null,
  day_of_week int not null,
  order_index int not null,
  target_sets int not null,
  target_reps text not null
);

-- WORKOUT SESSIONS Table
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  routine_id uuid references public.routines(id) on delete set null,
  started_at timestamptz not null,
  completed_at timestamptz,
  sync_status text default 'synced'
);

-- LOGS Table (Set level workout history)
create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.workout_sessions(id) on delete cascade not null,
  exercise_id uuid references public.exercise_library(id) on delete cascade not null,
  set_number int not null,
  weight_lifted numeric not null,
  reps int not null,
  date_completed timestamptz not null,
  client_uuid text unique not null
);

-- NUTRITION LOGS Table
create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  description text not null,
  calories int not null,
  protein_g numeric not null,
  carbs_g numeric not null,
  fats_g numeric not null,
  source text check (source in ('manual', 'ai_parsed')),
  confirmed boolean default false
);

-- AI RESPONSE CACHE Table
create table if not exists public.ai_cache (
  id uuid primary key default gen_random_uuid(),
  prompt_hash text unique not null,
  response_json jsonb not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS) on all tables
alter table public.users enable row level security;
alter table public.exercise_library enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.logs enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.ai_cache enable row level security;

-- USERS RLS Policies
create policy "Allow profile read to owner" on public.users for select using (auth.uid() = id);
create policy "Allow profile update to owner" on public.users for update using (auth.uid() = id);
create policy "Allow profile insert to owner" on public.users for insert with check (auth.uid() = id);

-- EXERCISE_LIBRARY RLS Policies
create policy "Allow read access to exercise library" on public.exercise_library for select using (true);
create policy "Allow insert access to owner" on public.exercise_library for insert with check (auth.uid() = created_by);
create policy "Allow update access to owner" on public.exercise_library for update using (auth.uid() = created_by);

-- ROUTINES RLS Policies
create policy "Allow routine read to owner" on public.routines for select using (auth.uid() = user_id);
create policy "Allow routine insert to owner" on public.routines for insert with check (auth.uid() = user_id);
create policy "Allow routine update to owner" on public.routines for update using (auth.uid() = user_id);
create policy "Allow routine delete to owner" on public.routines for delete using (auth.uid() = user_id);

-- ROUTINE_EXERCISES RLS Policies
create policy "Allow routine_exercises read to owner" on public.routine_exercises for select
  using (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()));
create policy "Allow routine_exercises write to owner" on public.routine_exercises for insert
  with check (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()));
create policy "Allow routine_exercises update to owner" on public.routine_exercises for update
  using (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()));
create policy "Allow routine_exercises delete to owner" on public.routine_exercises for delete
  using (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()));

-- WORKOUT_SESSIONS RLS Policies
create policy "Allow workout_sessions read to owner" on public.workout_sessions for select using (auth.uid() = user_id);
create policy "Allow workout_sessions write to owner" on public.workout_sessions for insert with check (auth.uid() = user_id);
create policy "Allow workout_sessions update to owner" on public.workout_sessions for update using (auth.uid() = user_id);
create policy "Allow workout_sessions delete to owner" on public.workout_sessions for delete using (auth.uid() = user_id);

-- LOGS RLS Policies
create policy "Allow logs read to owner" on public.logs for select
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "Allow logs write to owner" on public.logs for insert
  with check (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "Allow logs update to owner" on public.logs for update
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "Allow logs delete to owner" on public.logs for delete
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));

-- NUTRITION_LOGS RLS Policies
create policy "Allow nutrition_logs read to owner" on public.nutrition_logs for select using (auth.uid() = user_id);
create policy "Allow nutrition_logs write to owner" on public.nutrition_logs for insert with check (auth.uid() = user_id);
create policy "Allow nutrition_logs update to owner" on public.nutrition_logs for update using (auth.uid() = user_id);
create policy "Allow nutrition_logs delete to owner" on public.nutrition_logs for delete using (auth.uid() = user_id);

-- AI_CACHE RLS Policies
create policy "Allow system read/write to AI Cache" on public.ai_cache for all using (true);

-- User trigger to automatically populate public.users on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, fitness_goal, daily_calories, daily_protein_g, daily_carbs_g, daily_fats_g)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    'general',
    2000,
    150,
    200,
    65
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
