-- Table to track each quiz attempt
create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references quizzes(id) on delete cascade,
  score integer not null,
  percentage numeric not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Table to track answers for each attempt
create table if not exists quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references quiz_attempts(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  selected_option_id uuid references question_options(id) on delete set null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

-- Indexes for fast lookup
create index if not exists idx_quiz_attempts_user_quiz on quiz_attempts(user_id, quiz_id);
create index if not exists idx_quiz_attempt_answers_attempt on quiz_attempt_answers(attempt_id);
