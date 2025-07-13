-- Add indexes for better analytics performance

-- Index for quiz attempts by completion date (for time-based analytics)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at 
ON quiz_attempts(completed_at DESC);

-- Index for quiz attempts by quiz and completion date (for quiz-specific analytics)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_completed 
ON quiz_attempts(quiz_id, completed_at DESC);

-- Index for attempt answers by question (for question-level analytics)
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_question_correct 
ON quiz_attempt_answers(question_id, is_correct);

-- Index for attempt answers by attempt and question (for detailed analysis)
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_attempt_question 
ON quiz_attempt_answers(attempt_id, question_id);

-- Add a column to quiz_attempts to track time spent (for future use)
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0;

-- Create a view for quick analytics queries
CREATE OR REPLACE VIEW quiz_analytics_summary AS
SELECT 
    q.id as quiz_id,
    q.title,
    q.user_id as owner_id,
    q.difficulty as perceived_difficulty,
    q.created_at as quiz_created_at,
    COUNT(DISTINCT qa.id) as total_attempts,
    COUNT(DISTINCT qa.user_id) as unique_users,
    ROUND(AVG(qa.percentage), 1) as average_score,
    MAX(qa.percentage) as highest_score,
    MIN(qa.percentage) as lowest_score,
    COUNT(DISTINCT qu.id) as question_count,
    COUNT(qa.id) FILTER (WHERE qa.completed_at >= NOW() - INTERVAL '24 hours') as attempts_last_24h,
    COUNT(qa.id) FILTER (WHERE qa.completed_at >= NOW() - INTERVAL '7 days') as attempts_last_7d,
    COUNT(qa.id) FILTER (WHERE qa.completed_at >= NOW() - INTERVAL '30 days') as attempts_last_30d
FROM quizzes q
LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
LEFT JOIN questions qu ON q.id = qu.quiz_id
GROUP BY q.id, q.title, q.user_id, q.difficulty, q.created_at;

-- Add RLS policy for the analytics view
ALTER VIEW quiz_analytics_summary OWNER TO postgres;

-- Create a function to get question difficulty based on correct rate
CREATE OR REPLACE FUNCTION get_question_difficulty(question_id UUID)
RETURNS TEXT AS $$
DECLARE
    correct_rate DECIMAL;
BEGIN
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE (COUNT(*) FILTER (WHERE is_correct = true) * 100.0 / COUNT(*))
        END
    INTO correct_rate
    FROM quiz_attempt_answers
    WHERE quiz_attempt_answers.question_id = get_question_difficulty.question_id;
    
    RETURN CASE 
        WHEN correct_rate >= 80 THEN 'easy'
        WHEN correct_rate >= 60 THEN 'medium'
        WHEN correct_rate >= 40 THEN 'hard'
        ELSE 'very_hard'
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get top performers for a quiz
CREATE OR REPLACE FUNCTION get_quiz_top_performers(quiz_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    user_name TEXT,
    user_avatar_url TEXT,
    score INTEGER,
    percentage DECIMAL,
    completed_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qa.user_id,
        p.name as user_name,
        p.avatar_url as user_avatar_url,
        qa.score,
        qa.percentage,
        qa.completed_at
    FROM quiz_attempts qa
    LEFT JOIN profiles p ON qa.user_id = p.id
    WHERE qa.quiz_id = get_quiz_top_performers.quiz_id
    ORDER BY qa.percentage DESC, qa.completed_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
