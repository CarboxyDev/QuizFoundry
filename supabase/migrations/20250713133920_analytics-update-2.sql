-- Analytics optimization for creator and participant analytics

-- Additional indexes for improved analytics performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_completed 
ON quiz_attempts(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz_completed 
ON quiz_attempts(user_id, quiz_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_quizzes_user_created 
ON quizzes(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty_type 
ON quizzes(difficulty, is_manual);

-- Create a view for creator analytics summaries for better performance
CREATE OR REPLACE VIEW creator_analytics_summary AS
SELECT 
    q.user_id as creator_id,
    COUNT(DISTINCT q.id) as total_quizzes,
    COUNT(DISTINCT qa.id) as total_attempts,
    COUNT(DISTINCT qa.user_id) as total_unique_users,
    ROUND(AVG(qa.percentage), 1) as average_score,
    COUNT(DISTINCT q.id) FILTER (WHERE q.difficulty = 'easy') as easy_quizzes,
    COUNT(DISTINCT q.id) FILTER (WHERE q.difficulty = 'medium') as medium_quizzes,
    COUNT(DISTINCT q.id) FILTER (WHERE q.difficulty = 'hard') as hard_quizzes,
    COUNT(DISTINCT q.id) FILTER (WHERE q.is_manual = true) as manual_quizzes,
    COUNT(DISTINCT q.id) FILTER (WHERE q.is_manual = false) as ai_quizzes,
    COUNT(qa.id) FILTER (WHERE qa.completed_at >= NOW() - INTERVAL '24 hours') as attempts_last_24h,
    COUNT(qa.id) FILTER (WHERE qa.completed_at >= NOW() - INTERVAL '7 days') as attempts_last_7d,
    COUNT(qa.id) FILTER (WHERE qa.completed_at >= NOW() - INTERVAL '30 days') as attempts_last_30d,
    MAX(qa.completed_at) as last_attempt_date
FROM quizzes q
LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
GROUP BY q.user_id;

-- Create a view for participant analytics summaries
CREATE OR REPLACE VIEW participant_analytics_summary AS
SELECT 
    qa.user_id as participant_id,
    COUNT(DISTINCT qa.id) as total_attempts,
    COUNT(DISTINCT qa.quiz_id) as unique_quizzes,
    ROUND(AVG(qa.percentage), 1) as average_score,
    MAX(qa.percentage) as highest_score,
    MIN(qa.percentage) as lowest_score,
    COUNT(*) FILTER (WHERE qa.percentage = 100) as perfect_scores,
    COUNT(qa.id) FILTER (WHERE qa.completed_at >= NOW() - INTERVAL '24 hours') as attempts_last_24h,
    COUNT(qa.id) FILTER (WHERE qa.completed_at >= NOW() - INTERVAL '7 days') as attempts_last_7d,
    COUNT(qa.id) FILTER (WHERE qa.completed_at >= NOW() - INTERVAL '30 days') as attempts_last_30d,
    MAX(qa.completed_at) as last_attempt_date,
    MIN(qa.completed_at) as first_attempt_date
FROM quiz_attempts qa
JOIN quizzes q ON qa.quiz_id = q.id
GROUP BY qa.user_id;

-- Add RLS policies for the new views
ALTER VIEW creator_analytics_summary OWNER TO postgres;
ALTER VIEW participant_analytics_summary OWNER TO postgres;

-- Function to calculate user quiz streaks (for participant analytics)
CREATE OR REPLACE FUNCTION calculate_user_quiz_streak(user_id_param UUID)
RETURNS TABLE (
    current_streak INTEGER,
    longest_streak INTEGER,
    last_active_date DATE
) AS $$
DECLARE
    streak_record RECORD;
    temp_streak INTEGER := 0;
    max_streak INTEGER := 0;
    current_streak_val INTEGER := 0;
    last_date DATE;
    prev_date DATE;
    today_date DATE := CURRENT_DATE;
BEGIN
    -- Get all unique activity dates for the user, ordered
    FOR streak_record IN
        SELECT DISTINCT DATE(completed_at) as activity_date
        FROM quiz_attempts qa
        WHERE qa.user_id = user_id_param
        ORDER BY activity_date ASC
    LOOP
        IF prev_date IS NULL THEN
            temp_streak := 1;
            last_date := streak_record.activity_date;
        ELSIF streak_record.activity_date = prev_date + INTERVAL '1 day' THEN
            temp_streak := temp_streak + 1;
            last_date := streak_record.activity_date;
        ELSE
            max_streak := GREATEST(max_streak, temp_streak);
            temp_streak := 1;
            last_date := streak_record.activity_date;
        END IF;
        
        prev_date := streak_record.activity_date;
    END LOOP;
    
    -- Update max streak with final temp_streak
    max_streak := GREATEST(max_streak, temp_streak);
    
    -- Calculate current streak (from today backwards)
    current_streak_val := 0;
    IF last_date IS NOT NULL AND (today_date = last_date OR today_date = last_date + INTERVAL '1 day') THEN
        SELECT COUNT(DISTINCT DATE(completed_at)) INTO current_streak_val
        FROM quiz_attempts qa
        WHERE qa.user_id = user_id_param 
        AND DATE(completed_at) >= (
            SELECT MIN(consecutive_date) FROM (
                SELECT activity_date as consecutive_date,
                       activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date))::INTEGER * INTERVAL '1 day' as group_date
                FROM (
                    SELECT DISTINCT DATE(completed_at) as activity_date
                    FROM quiz_attempts qa2
                    WHERE qa2.user_id = user_id_param
                    AND DATE(completed_at) <= today_date
                    ORDER BY activity_date DESC
                ) dates
            ) grouped
            WHERE group_date = (
                SELECT activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date))::INTEGER * INTERVAL '1 day' as group_date
                FROM (
                    SELECT DISTINCT DATE(completed_at) as activity_date
                    FROM quiz_attempts qa3
                    WHERE qa3.user_id = user_id_param
                    AND DATE(completed_at) <= today_date
                    ORDER BY activity_date DESC
                    LIMIT 1
                ) latest
            )
        );
    END IF;
    
    RETURN QUERY SELECT current_streak_val, max_streak, last_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
