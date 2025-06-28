-- profiles table
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  role text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can access their profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their profile"
  on profiles for update using (auth.uid() = id);


-- onboarding_progress table
create table onboarding_progress (
  user_id uuid primary key references auth.users on delete cascade,
  flow_type text not null,
  current_step int default 0,
  is_complete boolean default false,
  started_at timestamptz default now(),
  completed_at timestamptz
);

alter table onboarding_progress enable row level security;

create policy "Users can manage their onboarding progress"
  on onboarding_progress
  for all
  using (auth.uid() = user_id);
