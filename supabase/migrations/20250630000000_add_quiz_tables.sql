-- quizzes table
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  description text,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  is_public boolean default true,
  is_ai_generated boolean default true,
  is_manual boolean default false,
  original_prompt text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- questions table
create table questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  question_text text not null,
  question_type text not null default 'multiple_choice' check (question_type in ('multiple_choice', 'short_answer')),
  order_index int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- question_options table (for multiple choice questions)
create table question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean default false,
  order_index int not null,
  created_at timestamptz default now()
);

-- Add indexes for better performance
create index idx_quizzes_user_id on quizzes(user_id);
create index idx_quizzes_is_public on quizzes(is_public);
create index idx_quizzes_created_at on quizzes(created_at desc);
create index idx_questions_quiz_id on questions(quiz_id);
create index idx_questions_order_index on questions(quiz_id, order_index);
create index idx_question_options_question_id on question_options(question_id);
create index idx_question_options_order_index on question_options(question_id, order_index);

-- Enable RLS on all tables
alter table quizzes enable row level security;
alter table questions enable row level security;
alter table question_options enable row level security;

-- RLS policies for quizzes
create policy "Users can view their own quizzes"
  on quizzes for select using (auth.uid() = user_id);

create policy "Users can view public quizzes"
  on quizzes for select using (is_public = true);

create policy "Users can insert their own quizzes"
  on quizzes for insert with check (auth.uid() = user_id);

create policy "Users can update their own quizzes"
  on quizzes for update using (auth.uid() = user_id);

create policy "Users can delete their own quizzes"
  on quizzes for delete using (auth.uid() = user_id);

-- RLS policies for questions
create policy "Users can view questions of accessible quizzes"
  on questions for select using (
    exists (
      select 1 from quizzes 
      where quizzes.id = questions.quiz_id 
      and (quizzes.user_id = auth.uid() or quizzes.is_public = true)
    )
  );

create policy "Users can insert questions to their own quizzes"
  on questions for insert with check (
    exists (
      select 1 from quizzes 
      where quizzes.id = questions.quiz_id 
      and quizzes.user_id = auth.uid()
    )
  );

create policy "Users can update questions in their own quizzes"
  on questions for update using (
    exists (
      select 1 from quizzes 
      where quizzes.id = questions.quiz_id 
      and quizzes.user_id = auth.uid()
    )
  );

create policy "Users can delete questions from their own quizzes"
  on questions for delete using (
    exists (
      select 1 from quizzes 
      where quizzes.id = questions.quiz_id 
      and quizzes.user_id = auth.uid()
    )
  );

-- RLS policies for question_options
create policy "Users can view options of accessible questions"
  on question_options for select using (
    exists (
      select 1 from questions 
      join quizzes on quizzes.id = questions.quiz_id
      where questions.id = question_options.question_id 
      and (quizzes.user_id = auth.uid() or quizzes.is_public = true)
    )
  );

create policy "Users can insert options to questions in their own quizzes"
  on question_options for insert with check (
    exists (
      select 1 from questions 
      join quizzes on quizzes.id = questions.quiz_id
      where questions.id = question_options.question_id 
      and quizzes.user_id = auth.uid()
    )
  );

create policy "Users can update options in their own quizzes"
  on question_options for update using (
    exists (
      select 1 from questions 
      join quizzes on quizzes.id = questions.quiz_id
      where questions.id = question_options.question_id 
      and quizzes.user_id = auth.uid()
    )
  );

create policy "Users can delete options from their own quizzes"
  on question_options for delete using (
    exists (
      select 1 from questions 
      join quizzes on quizzes.id = questions.quiz_id
      where questions.id = question_options.question_id 
      and quizzes.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers to auto-update updated_at
create trigger update_quizzes_updated_at
  before update on quizzes
  for each row execute function update_updated_at_column();

create trigger update_questions_updated_at
  before update on questions
  for each row execute function update_updated_at_column(); 