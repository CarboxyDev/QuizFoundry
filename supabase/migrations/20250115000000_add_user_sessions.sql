-- User sessions table for persistent authentication
create table user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_token text not null unique,
  refresh_token text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_agent text,
  ip_address inet,
  is_active boolean default true
);

-- Indexes for performance
create index idx_user_sessions_session_token on user_sessions(session_token);
create index idx_user_sessions_user_id on user_sessions(user_id);
create index idx_user_sessions_expires_at on user_sessions(expires_at);
create index idx_user_sessions_active on user_sessions(is_active, expires_at);

-- Enable RLS
alter table user_sessions enable row level security;

-- RLS policies - users can only access their own sessions
create policy "Users can view their own sessions"
  on user_sessions for select using (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on user_sessions for update using (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on user_sessions for delete using (auth.uid() = user_id);

-- Function to cleanup expired sessions
create or replace function cleanup_expired_sessions()
returns void as $$
begin
  delete from user_sessions 
  where expires_at < now() or is_active = false;
end;
$$ language plpgsql security definer;

-- Function to update session updated_at timestamp
create or replace function update_session_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_user_sessions_updated_at
  before update on user_sessions
  for each row execute function update_session_updated_at(); 