import supabase from "../lib/supabase";
import { AppError } from "../errors/AppError";
import {
  generateQuizWithAI,
  type GeneratedQuiz,
  type QuizGenerationInput,
} from "../lib/gemini";
import type {
  CreateQuizExpressModeInput,
  CreateQuizAdvancedModeInput,
  CreateManualQuizInput,
  UpdateQuizInput,
  CreateQuestionInput,
  UpdateQuestionInput,
} from "../schemas/quizSchemas";

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
      false // is_manual = false for Express Mode
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
      input.isManualMode
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
  isManual: boolean
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
        is_public: true, // Default to public
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
 * Get public quizzes
 */
export async function getPublicQuizzes(
  limit: number = 50,
  offset: number = 0
): Promise<Quiz[]> {
  console.log(
    `[Quiz Service] Fetching public quizzes (limit: ${limit}, offset: ${offset})`
  );

  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(`Failed to fetch public quizzes: ${error.message}`, 500);
  }

  console.log(`[Quiz Service] Found ${data?.length || 0} public quizzes`);
  return data || [];
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
