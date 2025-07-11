import supabase from "../lib/supabase";
import { AppError } from "../errors/AppError";
import {
  generateQuizWithAI,
  type GeneratedQuiz,
  type QuizGenerationInput,
  generateCreativeQuizPrompt,
} from "../lib/gemini";
import type {
  CreateQuizExpressModeInput,
  CreateQuizAdvancedModeInput,
  CreateManualQuizInput,
  UpdateQuizInput,
  CreateQuestionInput,
  UpdateQuestionInput,
} from "../schemas/quizSchemas";
import type {
  SubmitQuizRequest,
  SubmitQuizResult,
  SubmitQuizQuestionResult,
} from "../types/api";

// =============================================
// TYPES
// =============================================

export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
  is_public: boolean;
  is_ai_generated: boolean;
  is_manual: boolean;
  original_prompt?: string;
  created_at: string;
  updated_at: string;
  // Aggregate stats (optional, added for UI convenience)
  attempts?: number;
  average_score?: number;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "short_answer";
  order_index: number;
  created_at: string;
  updated_at: string;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
}

export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

// =============================================
// EXPRESS MODE - Simple quiz creation with defaults
// =============================================

/**
 * Create a quiz using Express Mode
 * Uses defaults: 5 questions, 4 options, medium difficulty
 * Saves with is_manual = false
 */
export async function createQuizExpressMode(
  userId: string,
  input: CreateQuizExpressModeInput
): Promise<QuizWithQuestions> {
  try {
    console.log(`[Quiz Service] Creating Express Mode quiz for user ${userId}`);

    // Express Mode defaults
    const defaults = {
      questionCount: 5,
      optionsCount: 4,
      difficulty: "medium" as const,
    };

    // Generate quiz with AI using defaults
    const generatedQuiz = await generateQuizWithAI({
      prompt: input.prompt,
      questionCount: defaults.questionCount,
      optionsCount: defaults.optionsCount,
      difficulty: defaults.difficulty,
    });

    // Save to database with is_manual = false (auto-generated)
    const quiz = await saveGeneratedQuiz(
      userId,
      input.prompt,
      generatedQuiz,
      false, // is_manual = false for Express Mode
      input.is_public
    );

    console.log(
      `[Quiz Service] Successfully created Express Mode quiz: ${quiz.id}`
    );
    return quiz;
  } catch (error) {
    console.error("[Quiz Service] Error creating quiz in Express Mode:", error);
    throw error;
  }
}

// =============================================
// ADVANCED MODE - Custom settings with optional Manual Mode
// =============================================

/**
 * Create a quiz using Advanced Mode
 * Uses custom settings provided by user
 * Manual Mode determines is_manual flag
 */
export async function createQuizAdvancedMode(
  userId: string,
  input: CreateQuizAdvancedModeInput
): Promise<QuizWithQuestions> {
  try {
    console.log(
      `[Quiz Service] Creating Advanced Mode quiz for user ${userId} (Manual: ${input.isManualMode})`
    );

    // Generate quiz with AI using custom settings
    const generatedQuiz = await generateQuizWithAI({
      prompt: input.prompt,
      questionCount: input.questionCount,
      optionsCount: input.optionsCount,
      difficulty: input.difficulty,
    });

    // Save to database
    // is_manual = true if Manual Mode is ON, false otherwise
    const quiz = await saveGeneratedQuiz(
      userId,
      input.prompt,
      generatedQuiz,
      input.isManualMode,
      input.is_public
    );

    console.log(
      `[Quiz Service] Successfully created Advanced Mode quiz: ${quiz.id}`
    );
    return quiz;
  } catch (error) {
    console.error(
      "[Quiz Service] Error creating quiz in Advanced Mode:",
      error
    );
    throw error;
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Save AI-generated quiz to database
 */
async function saveGeneratedQuiz(
  userId: string,
  originalPrompt: string,
  generatedQuiz: GeneratedQuiz,
  isManual: boolean,
  isPublic: boolean = true
): Promise<QuizWithQuestions> {
  try {
    console.log(
      `[Quiz Service] Saving quiz to database: "${generatedQuiz.title}"`
    );

    // Create quiz record
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        user_id: userId,
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        difficulty: generatedQuiz.difficulty,
        is_public: isPublic, // Use provided visibility setting
        is_ai_generated: true, // Always true for AI-generated content
        is_manual: isManual, // Set based on mode
        original_prompt: originalPrompt,
      })
      .select()
      .single();

    if (quizError || !quizData) {
      throw new AppError(`Failed to create quiz: ${quizError?.message}`, 500);
    }

    console.log(`[Quiz Service] Created quiz record: ${quizData.id}`);

    // Save questions and options
    const questions: Question[] = [];

    for (const [
      index,
      generatedQuestion,
    ] of generatedQuiz.questions.entries()) {
      console.log(
        `[Quiz Service] Saving question ${index + 1}/${generatedQuiz.questions.length}`
      );

      // Insert question
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert({
          quiz_id: quizData.id,
          question_text: generatedQuestion.question_text,
          question_type: generatedQuestion.question_type,
          order_index: generatedQuestion.order_index,
        })
        .select()
        .single();

      if (questionError || !questionData) {
        throw new AppError(
          `Failed to create question ${index + 1}: ${questionError?.message}`,
          500
        );
      }

      // Insert options for this question
      const optionsToInsert = generatedQuestion.options.map((option) => ({
        question_id: questionData.id,
        option_text: option.option_text,
        is_correct: option.is_correct,
        order_index: option.order_index,
      }));

      const { data: optionsData, error: optionsError } = await supabase
        .from("question_options")
        .insert(optionsToInsert)
        .select();

      if (optionsError) {
        throw new AppError(
          `Failed to create options for question ${index + 1}: ${optionsError.message}`,
          500
        );
      }

      questions.push({
        ...questionData,
        options: optionsData || [],
      });
    }

    console.log(
      `[Quiz Service] Successfully saved quiz with ${questions.length} questions`
    );

    return {
      ...quizData,
      questions,
    };
  } catch (error) {
    console.error("[Quiz Service] Error saving generated quiz:", error);
    throw error;
  }
}

// =============================================
// MANUAL QUIZ CREATION (separate from AI)
// =============================================

/**
 * Create a manual quiz (without AI)
 */
export async function createManualQuiz(
  userId: string,
  input: CreateManualQuizInput
): Promise<Quiz> {
  console.log(
    `[Quiz Service] Creating manual quiz for user ${userId}: "${input.title}"`
  );

  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description,
      difficulty: input.difficulty,
      is_public: input.is_public ?? true,
      is_ai_generated: false, // Manual creation, not AI
      is_manual: true, // Manual quiz creation
    })
    .select()
    .single();

  if (error) {
    console.error("[Quiz Service] Error creating manual quiz:", error);
    throw new AppError(`Failed to create quiz: ${error.message}`, 500);
  }

  console.log(`[Quiz Service] Successfully created manual quiz: ${data.id}`);
  return data;
}

// =============================================
// QUIZ RETRIEVAL AND MANAGEMENT
// =============================================

/**
 * Get a quiz by ID with questions
 */
export async function getQuizById(
  quizId: string,
  userId?: string
): Promise<QuizWithQuestions | null> {
  console.log(
    `[Quiz Service] Fetching quiz ${quizId} for user ${userId || "anonymous"}`
  );

  // Get the quiz
  const { data: quizData, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (quizError) {
    if (quizError.code === "PGRST116") {
      console.log(`[Quiz Service] Quiz ${quizId} not found`);
      return null;
    }
    throw new AppError(`Failed to fetch quiz: ${quizError.message}`, 500);
  }

  // Check access permissions
  if (!quizData.is_public && (!userId || quizData.user_id !== userId)) {
    console.log(
      `[Quiz Service] Access denied to quiz ${quizId} for user ${userId}`
    );
    throw new AppError("Access denied to this quiz", 403);
  }

  // Get questions with options
  const { data: questionsData, error: questionsError } = await supabase
    .from("questions")
    .select(
      `
      *,
      question_options (*)
    `
    )
    .eq("quiz_id", quizId)
    .order("order_index");

  if (questionsError) {
    throw new AppError(
      `Failed to fetch questions: ${questionsError.message}`,
      500
    );
  }

  console.log(
    `[Quiz Service] Successfully fetched quiz ${quizId} with ${questionsData?.length || 0} questions`
  );

  return {
    ...quizData,
    questions: questionsData || [],
  };
}

/**
 * Get user's quizzes
 */
export async function getUserQuizzes(userId: string): Promise<Quiz[]> {
  console.log(`[Quiz Service] Fetching quizzes for user ${userId}`);

  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(`Failed to fetch user quizzes: ${error.message}`, 500);
  }

  console.log(
    `[Quiz Service] Found ${data?.length || 0} quizzes for user ${userId}`
  );
  return data || [];
}

/**
 * Get public quizzes with question count
 */
export async function getPublicQuizzes(
  limit: number = 50,
  offset: number = 0
): Promise<Quiz[]> {
  console.log(
    `[Quiz Service] Fetching public quizzes (limit: ${limit}, offset: ${offset})`
  );

  // First get the quizzes
  const { data: quizzesData, error: quizzesError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (quizzesError) {
    throw new AppError(
      `Failed to fetch public quizzes: ${quizzesError.message}`,
      500
    );
  }

  if (!quizzesData || quizzesData.length === 0) {
    console.log(`[Quiz Service] Found 0 public quizzes`);
    return [];
  }

  // Get question counts for these quizzes
  const quizIds = quizzesData.map((quiz) => quiz.id);
  const { data: questionCounts, error: countsError } = await supabase
    .from("questions")
    .select("quiz_id")
    .in("quiz_id", quizIds);

  if (countsError) {
    throw new AppError(
      `Failed to fetch question counts: ${countsError.message}`,
      500
    );
  }

  // Count questions per quiz
  const countMap = new Map<string, number>();
  (questionCounts || []).forEach((q: any) => {
    const quizId = q.quiz_id;
    countMap.set(quizId, (countMap.get(quizId) || 0) + 1);
  });

  // Get attempts counts for these quizzes
  const { data: attemptsData, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select("quiz_id")
    .in("quiz_id", quizIds);

  if (attemptsError) {
    throw new AppError(
      `Failed to fetch attempts counts: ${attemptsError.message}`,
      500
    );
  }

  // Count attempts per quiz
  const attemptsMap = new Map<string, number>();
  (attemptsData || []).forEach((a: any) => {
    const quizId = a.quiz_id;
    attemptsMap.set(quizId, (attemptsMap.get(quizId) || 0) + 1);
  });

  // Add question count and mock questions array for frontend compatibility
  const quizzesWithQuestionCount = quizzesData.map((quiz: any) => {
    const questionCount = countMap.get(quiz.id) || 0;
    const attempts = attemptsMap.get(quiz.id) || 0;
    return {
      ...quiz,
      attempts,
      questions: Array(questionCount)
        .fill(null)
        .map((_, index) => ({ id: `question-${index}` })),
    };
  });

  console.log(
    `[Quiz Service] Found ${quizzesWithQuestionCount.length} public quizzes`
  );
  return quizzesWithQuestionCount;
}

/**
 * Update a quiz
 */
export async function updateQuiz(
  quizId: string,
  userId: string,
  input: UpdateQuizInput
): Promise<Quiz> {
  console.log(`[Quiz Service] Updating quiz ${quizId} for user ${userId}`);

  const { data, error } = await supabase
    .from("quizzes")
    .update(input)
    .eq("id", quizId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Quiz not found or access denied", 404);
    }
    throw new AppError(`Failed to update quiz: ${error.message}`, 500);
  }

  console.log(`[Quiz Service] Successfully updated quiz ${quizId}`);
  return data;
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(
  quizId: string,
  userId: string
): Promise<void> {
  console.log(`[Quiz Service] Deleting quiz ${quizId} for user ${userId}`);

  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId)
    .eq("user_id", userId);

  if (error) {
    throw new AppError(`Failed to delete quiz: ${error.message}`, 500);
  }

  console.log(`[Quiz Service] Successfully deleted quiz ${quizId}`);
}

/**
 * Add a question to a quiz
 */
export async function createQuestion(
  userId: string,
  input: CreateQuestionInput
): Promise<Question> {
  console.log(
    `[Quiz Service] Adding question to quiz ${input.quiz_id} for user ${userId}`
  );

  // Verify user owns the quiz
  const { data: quizData, error: quizError } = await supabase
    .from("quizzes")
    .select("user_id")
    .eq("id", input.quiz_id)
    .eq("user_id", userId)
    .single();

  if (quizError || !quizData) {
    throw new AppError("Quiz not found or access denied", 404);
  }

  // Create the question
  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .insert({
      quiz_id: input.quiz_id,
      question_text: input.question_text,
      question_type: input.question_type,
      order_index: input.order_index,
    })
    .select()
    .single();

  if (questionError) {
    throw new AppError(
      `Failed to create question: ${questionError.message}`,
      500
    );
  }

  // Add options if provided
  if (input.options && input.options.length > 0) {
    const optionsToInsert = input.options.map((option) => ({
      question_id: questionData.id,
      option_text: option.option_text,
      is_correct: option.is_correct,
      order_index: option.order_index,
    }));

    const { data: optionsData, error: optionsError } = await supabase
      .from("question_options")
      .insert(optionsToInsert)
      .select();

    if (optionsError) {
      throw new AppError(
        `Failed to create question options: ${optionsError.message}`,
        500
      );
    }

    console.log(
      `[Quiz Service] Successfully added question with ${optionsData?.length || 0} options`
    );

    return {
      ...questionData,
      options: optionsData || [],
    };
  }

  console.log(`[Quiz Service] Successfully added question without options`);
  return {
    ...questionData,
    options: [],
  };
}

/**
 * Submit a quiz attempt, validate answers, compute score, and store attempt/answers
 */
export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  req: SubmitQuizRequest
): Promise<SubmitQuizResult> {
  // Fetch quiz with questions and options
  const quiz = await getQuizById(quizId, userId);
  if (!quiz) throw new AppError("Quiz not found", 404);
  if (!quiz.questions || quiz.questions.length === 0)
    throw new AppError("Quiz has no questions", 400);

  // Map answers for quick lookup
  const answerMap = new Map(req.answers.map((a) => [a.questionId, a.optionId]));

  // Prepare per-question results
  const results: SubmitQuizQuestionResult[] = [];
  let correctCount = 0;

  for (const question of quiz.questions) {
    const selectedOptionId = answerMap.get(question.id) || null;
    // Support both question_options and options for compatibility
    const options =
      (question as any).question_options || (question as any).options;
    const correctOption = options?.find((o: any) => o.is_correct);
    if (!correctOption)
      throw new AppError("Question missing correct answer", 500);
    const isCorrect = selectedOptionId === correctOption.id;
    if (isCorrect) correctCount++;
    results.push({
      questionId: question.id,
      selectedOptionId,
      correctOptionId: correctOption.id,
      isCorrect,
    });
  }

  const score = correctCount;
  const percentage = (score / quiz.questions.length) * 100;

  // Insert quiz_attempts row
  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      quiz_id: quizId,
      score,
      percentage,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (attemptError || !attempt)
    throw new AppError("Failed to record attempt", 500);

  // Insert quiz_attempt_answers rows
  const answerRows = results.map((r) => ({
    attempt_id: attempt.id,
    question_id: r.questionId,
    selected_option_id: r.selectedOptionId,
    is_correct: r.isCorrect,
  }));
  const { error: answersError } = await supabase
    .from("quiz_attempt_answers")
    .insert(answerRows);
  if (answersError) throw new AppError("Failed to record answers", 500);

  return {
    attemptId: attempt.id,
    score,
    percentage,
    results,
    completedAt: attempt.completed_at,
  };
}

/**
 * Generate a creative quiz prompt (for "Surprise Me")
 */
export async function getCreativeQuizPrompt(): Promise<string> {
  return generateCreativeQuizPrompt();
}

// =============================================
// USER QUIZZES WITH AGGREGATED STATS
// =============================================

/**
 * Get a user's quizzes together with attempt statistics (attempt count & average score)
 */
export async function getUserQuizzesWithStats(
  userId: string
): Promise<(Quiz & { attempts: number; average_score: number })[]> {
  // First, fetch the quizzes that belong to the user
  const quizzes = await getUserQuizzes(userId);
  if (quizzes.length === 0) return [];

  // Build a lookup for quick aggregation
  const quizIds = quizzes.map((q) => q.id);

  // Fetch question counts for these quizzes (similar to getPublicQuizzes)
  const { data: questionCounts, error: countsError } = await supabase
    .from("questions")
    .select("quiz_id")
    .in("quiz_id", quizIds);

  if (countsError) {
    throw new AppError(
      `Failed to fetch question counts: ${countsError.message}`,
      500
    );
  }

  // Count questions per quiz
  const questionCountMap = new Map<string, number>();
  (questionCounts || []).forEach((q: any) => {
    const quizId = q.quiz_id;
    questionCountMap.set(quizId, (questionCountMap.get(quizId) || 0) + 1);
  });

  // Fetch all attempts for the fetched quizzes in one query
  const { data: attemptsData, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, percentage")
    .in("quiz_id", quizIds);

  if (attemptsError) {
    throw new AppError(
      `Failed to fetch quiz attempt statistics: ${attemptsError.message}`,
      500
    );
  }

  // Aggregate attempts per quiz
  const statsMap = new Map<
    string,
    { attempts: number; totalPercentage: number }
  >();

  (attemptsData || []).forEach((attempt) => {
    const quizId: string = (attempt as any).quiz_id;
    const percentage: number = (attempt as any).percentage;
    const existing = statsMap.get(quizId) || {
      attempts: 0,
      totalPercentage: 0,
    };
    statsMap.set(quizId, {
      attempts: existing.attempts + 1,
      totalPercentage: existing.totalPercentage + (percentage || 0),
    });
  });

  // Merge stats and question counts back into quizzes array
  return quizzes.map((quiz) => {
    const stats = statsMap.get(quiz.id) || { attempts: 0, totalPercentage: 0 };
    const attempts = stats.attempts;
    const average_score =
      attempts > 0 ? Number((stats.totalPercentage / attempts).toFixed(1)) : 0;

    // Add question count and mock questions array for frontend compatibility
    const questionCount = questionCountMap.get(quiz.id) || 0;

    return {
      ...quiz,
      attempts,
      average_score,
      questions: Array(questionCount)
        .fill(null)
        .map((_, index) => ({ id: `question-${index}` })),
    } as Quiz & { attempts: number; average_score: number };
  });
}

// =============================================
// QUIZ ATTEMPTS
// =============================================

/**
 * Fetch all attempts for a quiz (owner-only access)
 * Returns basic user info (id, name, avatar_url) together with score & timestamps.
 */
export interface QuizAttemptSummary {
  attemptId: string;
  userId: string;
  userName: string | null;
  userAvatarUrl: string | null;
  score: number;
  percentage: number;
  completedAt: string;
}

export async function getQuizAttempts(
  quizId: string,
  ownerId: string
): Promise<QuizAttemptSummary[]> {
  // Ensure the requester owns the quiz
  const { data: quizOwnerRow, error: quizOwnerError } = await supabase
    .from("quizzes")
    .select("user_id")
    .eq("id", quizId)
    .single();

  if (quizOwnerError || !quizOwnerRow) {
    throw new AppError("Quiz not found", 404);
  }

  if (quizOwnerRow.user_id !== ownerId) {
    throw new AppError("Access denied to this quiz's attempts", 403);
  }

  // Fetch attempts joined with profile information
  const { data: attemptsData, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select(
      `id, user_id, score, percentage, completed_at, profiles ( id, name, avatar_url )`
    )
    .eq("quiz_id", quizId)
    .order("completed_at", { ascending: false });

  if (attemptsError) {
    throw new AppError(
      `Failed to fetch quiz attempts: ${attemptsError.message}`,
      500
    );
  }

  // Map to summary objects
  return (attemptsData || []).map((attempt: any) => {
    const profile = (attempt as any).profiles || {};
    return {
      attemptId: attempt.id,
      userId: attempt.user_id,
      userName: profile.name ?? null,
      userAvatarUrl: profile.avatar_url ?? null,
      score: attempt.score,
      percentage: attempt.percentage,
      completedAt: attempt.completed_at,
    } as QuizAttemptSummary;
  });
}
