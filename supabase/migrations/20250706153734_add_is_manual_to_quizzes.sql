ALTER TABLE quizzes ADD COLUMN is_manual boolean DEFAULT false;
ALTER TABLE quizzes ALTER COLUMN is_public SET DEFAULT true;
