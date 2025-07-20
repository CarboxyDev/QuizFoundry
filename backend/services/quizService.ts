import supabase from "../lib/supabase";
import { AppError } from "../errors/AppError";
import {
  generateQuizWithAI,
  type GeneratedQuiz,
  generateCreativeQuizPrompt,
  validateQuizContent,
  type QuizContentForValidation,
  generateAdditionalQuestions,
  enhanceQuestion,
  generateAdditionalOptions,
  suggestQuestionTypes,
  type QuizContext,
  type GeneratedQuestionsResult,
  type EnhancedQuestionResult,
  type GeneratedOptionsResult,
  type QuestionTypeSuggestionsResult,
} from "../lib/gemini";
import type {
  CreateQuizExpressModeInput,
  CreateQuizAdvancedModeInput,
  CreateManualQuizInput,
  CreatePrototypeQuizInput,
  PublishManualQuizInput,
  UpdateQuizInput,
  UpdateQuizWithQuestionsInput,
  CreateQuestionInput,
} from "../schemas/quizSchemas";
import type {
  SubmitQuizRequest,
  SubmitQuizResult,
  SubmitQuizQuestionResult,
} from "../types/api";
import { env } from "../env";

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
  attempts?: number;
  average_score?: number;
  question_count?: number;
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

    const quiz = await saveGeneratedQuiz(
      userId,
      input.prompt,
      generatedQuiz,
      false,
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

/**
 * Create a quiz using Advanced Mode
 * Uses custom settings provided by user
 * Manual Mode determines whether to save to DB or return prototype
 */
export async function createQuizAdvancedMode(
  userId: string,
  input: CreateQuizAdvancedModeInput
): Promise<QuizWithQuestions> {
  try {
    console.log(
      `[Quiz Service] Creating Advanced Mode quiz for user ${userId})`
    );

    // Generate quiz with AI using custom settings
    const generatedQuiz = await generateQuizWithAI({
      prompt: input.prompt,
      questionCount: input.questionCount,
      optionsCount: input.optionsCount,
      difficulty: input.difficulty,
    });

    // Convert GeneratedQuiz to QuizWithQuestions format for consistent response
    const prototypeQuiz: QuizWithQuestions = {
      id: "prototype",
      user_id: userId,
      title: generatedQuiz.title,
      description: generatedQuiz.description,
      difficulty: generatedQuiz.difficulty,
      is_public: input.is_public,
      is_ai_generated: true,
      is_manual: true,
      original_prompt: input.prompt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: generatedQuiz.questions.map((q) => ({
        id: `prototype-question-${q.order_index}`,
        quiz_id: "prototype",
        question_text: q.question_text,
        question_type: q.question_type,
        order_index: q.order_index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        options: q.options.map((opt) => ({
          id: `prototype-option-${opt.order_index}`,
          question_id: `prototype-question-${q.order_index}`,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          order_index: opt.order_index,
          created_at: new Date().toISOString(),
        })),
      })),
    };

    return prototypeQuiz;
  } catch (error) {
    console.error(
      "[Quiz Service] Error creating quiz in Advanced Mode:",
      error
    );
    throw error;
  }
}

/**
 * Create a prototype quiz using AI but don't save to database
 * This is used for manual mode where user will edit the quiz before publishing
 */
export async function createPrototypeQuiz(
  input: CreatePrototypeQuizInput
): Promise<GeneratedQuiz> {
  try {
    console.log(`[Quiz Service] Creating prototype quiz for manual mode`);

    // Generate quiz with AI using custom settings
    const generatedQuiz = await generateQuizWithAI({
      prompt: input.prompt,
      questionCount: input.questionCount,
      optionsCount: input.optionsCount,
      difficulty: input.difficulty,
    });

    console.log(
      `[Quiz Service] Successfully created prototype quiz: "${generatedQuiz.title}"`
    );

    // Return the generated quiz without saving to database
    return generatedQuiz;
  } catch (error) {
    console.error("[Quiz Service] Error creating prototype quiz:", error);
    throw error;
  }
}

/**
 * Publish a manually edited quiz after AI security validation
 * This validates the content and saves it to the database
 */
export async function publishManualQuiz(
  userId: string,
  input: PublishManualQuizInput
): Promise<QuizWithQuestions> {
  try {
    console.log(
      `[Quiz Service] Publishing manual quiz for user ${userId}: "${input.title}"`
    );

    const contentForValidation: QuizContentForValidation = {
      title: input.title,
      description: input.description,
      questions: input.questions.map((q) => ({
        question_text: q.question_text,
        options: q.options.map((opt) => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        })),
      })),
    };

    /**
     * Do security checks with AI.
     * Only validate if quiz will be public and BYPASS_CHECKS is not set to true
     */
    if (env.BYPASS_CHECKS !== "true" && input.is_public) {
      console.log(
        `[Quiz Service] Quiz will be public - performing AI security validation`
      );

      const securityResult = await validateQuizContent(contentForValidation);

      if (!securityResult.isApproved) {
        console.log(
          `[Quiz Service] Manual quiz rejected by AI security check: ${securityResult.reasoning}`
        );

        // Create a more detailed error that includes validation results
        const detailedError = new AppError(
          `Quiz content was rejected: ${securityResult.reasoning}${
            securityResult.concerns.length > 0
              ? ` Specific concerns: ${securityResult.concerns.join(", ")}`
              : ""
          }`,
          400
        );

        // Add validation result details to the error
        (detailedError as any).validationResult = {
          reasoning: securityResult.reasoning,
          confidence: securityResult.confidence,
          concerns: securityResult.concerns,
        };

        throw detailedError;
      }

      console.log(
        `[Quiz Service] Manual quiz approved by AI security check (confidence: ${securityResult.confidence}%)`
      );
    } else if (!input.is_public) {
      console.log(
        `[Quiz Service] Quiz is private - skipping AI security validation`
      );
    }

    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description,
        difficulty: input.difficulty,
        is_public: input.is_public,
        is_ai_generated: false,
        is_manual: true,
        original_prompt: input.original_prompt,
      })
      .select()
      .single();

    if (quizError || !quizData) {
      throw new AppError(`Failed to create quiz: ${quizError?.message}`, 500);
    }

    console.log(`[Quiz Service] Created manual quiz record: ${quizData.id}`);

    const questions: Question[] = [];

    for (const [index, inputQuestion] of input.questions.entries()) {
      console.log(
        `[Quiz Service] Saving question ${index + 1}/${input.questions.length}`
      );

      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert({
          quiz_id: quizData.id,
          question_text: inputQuestion.question_text,
          question_type: inputQuestion.question_type,
          order_index: inputQuestion.order_index,
        })
        .select()
        .single();

      if (questionError || !questionData) {
        throw new AppError(
          `Failed to create question ${index + 1}: ${questionError?.message}`,
          500
        );
      }

      const optionsToInsert = inputQuestion.options.map((option) => ({
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
      `[Quiz Service] Successfully published manual quiz with ${questions.length} questions`
    );

    return {
      ...quizData,
      questions,
    };
  } catch (error) {
    console.error("[Quiz Service] Error publishing manual quiz:", error);
    throw error;
  }
}

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

    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        user_id: userId,
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        difficulty: generatedQuiz.difficulty,
        is_public: isPublic,
        is_ai_generated: true,
        is_manual: isManual,
        original_prompt: originalPrompt,
      })
      .select()
      .single();

    if (quizError || !quizData) {
      throw new AppError(`Failed to create quiz: ${quizError?.message}`, 500);
    }

    console.log(`[Quiz Service] Created quiz record: ${quizData.id}`);

    const questions: Question[] = [];

    for (const [
      index,
      generatedQuestion,
    ] of generatedQuiz.questions.entries()) {
      console.log(
        `[Quiz Service] Saving question ${index + 1}/${generatedQuiz.questions.length}`
      );

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
      is_ai_generated: false,
      is_manual: true,
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

export async function getQuizById(
  quizId: string,
  userId?: string
): Promise<QuizWithQuestions | null> {
  console.log(
    `[Quiz Service] Fetching quiz ${quizId} for user ${userId || "anonymous"}`
  );

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

  if (!quizData.is_public && (!userId || quizData.user_id !== userId)) {
    console.log(
      `[Quiz Service] Access denied to quiz ${quizId} for user ${userId}`
    );
    throw new AppError("Access denied to this quiz", 403);
  }

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

  // Get total attempts count for this quiz
  const { data: attemptsData, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select("id")
    .eq("quiz_id", quizId);

  if (attemptsError) {
    throw new AppError(
      `Failed to fetch attempts count: ${attemptsError.message}`,
      500
    );
  }

  const attemptsCount = attemptsData?.length || 0;

  console.log(
    `[Quiz Service] Successfully fetched quiz ${quizId} with ${questionsData?.length || 0} questions and ${attemptsCount} attempts`
  );

  return {
    ...quizData,
    questions: questionsData || [],
    attempts: attemptsCount,
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

export interface PublicQuizFilters {
  search?: string;
  difficulty?: "easy" | "medium" | "hard";
  type?: "ai" | "manual";
  sortBy?: "created_at" | "popularity" | "difficulty" | "title";
  sortOrder?: "asc" | "desc";
}

export interface PublicQuizzesResponse {
  quizzes: Quiz[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Get public quizzes with enhanced filtering and search
 */
export async function getPublicQuizzes(
  limit: number = 50,
  offset: number = 0,
  filters: PublicQuizFilters = {}
): Promise<PublicQuizzesResponse> {
  console.log(
    `[Quiz Service] Fetching public quizzes (limit: ${limit}, offset: ${offset}, filters: ${JSON.stringify(filters)})`
  );

  // Build the base query - temporarily simplified without joins
  let query = supabase.from("quizzes").select("*").eq("is_public", true);

  // Apply filters
  if (filters.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }

  if (filters.type) {
    const isAiGenerated = filters.type === "ai";
    query = query.eq("is_ai_generated", isAiGenerated);
  }

  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    query = query.or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    );
  }

  // Apply sorting
  const sortBy = filters.sortBy || "created_at";
  const sortOrder = filters.sortOrder || "desc";

  if (sortBy === "popularity") {
    // For popularity, we'll order by attempts count (handled after we get attempts data)
  } else if (sortBy === "difficulty") {
    // Custom ordering for difficulty: easy -> medium -> hard
    query = query.order("difficulty", { ascending: sortOrder === "asc" });
  } else {
    query = query.order(sortBy, { ascending: sortOrder === "asc" });
  }

  // Get total count first for pagination
  let countQuery = supabase
    .from("quizzes")
    .select("id", { count: "exact", head: true })
    .eq("is_public", true);

  if (filters.difficulty) {
    countQuery = countQuery.eq("difficulty", filters.difficulty);
  }
  if (filters.type) {
    const isAiGenerated = filters.type === "ai";
    countQuery = countQuery.eq("is_ai_generated", isAiGenerated);
  }
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    countQuery = countQuery.or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    );
  }

  const { count: totalCount, error: countError } = await countQuery;

  if (countError) {
    throw new AppError(`Failed to get quiz count: ${countError.message}`, 500);
  }

  // Apply pagination and execute query
  query = query.range(offset, offset + limit - 1);
  const { data: quizzesData, error: quizzesError } = await query;

  if (quizzesError) {
    throw new AppError(
      `Failed to fetch public quizzes: ${quizzesError.message}`,
      500
    );
  }

  if (!quizzesData || quizzesData.length === 0) {
    console.log(`[Quiz Service] Found 0 public quizzes`);
    return {
      quizzes: [],
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: false,
      },
    };
  }

  const quizIds = quizzesData.map((quiz) => quiz.id);

  // Get question counts
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

  const countMap = new Map<string, number>();
  (questionCounts || []).forEach((q: any) => {
    const quizId = q.quiz_id;
    countMap.set(quizId, (countMap.get(quizId) || 0) + 1);
  });

  // Get attempts counts
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

  const attemptsMap = new Map<string, number>();
  (attemptsData || []).forEach((a: any) => {
    const quizId = a.quiz_id;
    attemptsMap.set(quizId, (attemptsMap.get(quizId) || 0) + 1);
  });

  // Transform data and add stats
  let quizzesWithStats = quizzesData.map((quiz: any) => {
    const questionCount = countMap.get(quiz.id) || 0;
    const attempts = attemptsMap.get(quiz.id) || 0;

    return {
      ...quiz,
      attempts,
      question_count: questionCount,
    };
  });

  // Handle popularity sorting post-query since it requires attempts data
  if (filters.sortBy === "popularity") {
    quizzesWithStats.sort((a, b) => {
      const aAttempts = a.attempts || 0;
      const bAttempts = b.attempts || 0;
      return filters.sortOrder === "asc"
        ? aAttempts - bAttempts
        : bAttempts - aAttempts;
    });
  }

  console.log(`[Quiz Service] Found ${quizzesWithStats.length} public quizzes`);

  return {
    quizzes: quizzesWithStats,
    pagination: {
      total: totalCount || 0,
      limit,
      offset,
      hasMore: offset + limit < (totalCount || 0),
    },
  };
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

  // Check if content fields (title or description) are being updated
  const isContentUpdate =
    input.title !== undefined || input.description !== undefined;

  if (isContentUpdate) {
    console.log(
      `[Quiz Service] Content update detected - performing AI security validation`
    );

    // Fetch current quiz data to get the full content for validation
    const { data: currentQuiz, error: fetchError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !currentQuiz) {
      throw new AppError("Quiz not found or access denied", 404);
    }

    // Fetch current questions to include in validation
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
        `Failed to fetch questions for validation: ${questionsError.message}`,
        500
      );
    }

    // Prepare content for validation with updated values
    const contentForValidation: QuizContentForValidation = {
      title: input.title ?? currentQuiz.title,
      description: input.description ?? currentQuiz.description,
      questions: (questionsData || []).map((q) => ({
        question_text: q.question_text,
        options: (q.question_options || []).map((opt: any) => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        })),
      })),
    };

    // Check if quiz is or will be public - only validate public quizzes
    const willBePublic = input.is_public ?? currentQuiz.is_public;
    const isCurrentlyPublic = currentQuiz.is_public;

    // Apply AI security validation only if quiz is/will be public
    if (env.BYPASS_CHECKS !== "true" && (isCurrentlyPublic || willBePublic)) {
      console.log(
        `[Quiz Service] Quiz is/will be public - performing AI security validation`
      );

      const securityResult = await validateQuizContent(contentForValidation);

      if (!securityResult.isApproved) {
        console.log(
          `[Quiz Service] Quiz update rejected by AI security check: ${securityResult.reasoning}`
        );

        // Create a more detailed error that includes validation results
        const detailedError = new AppError(
          `Quiz content was rejected: ${securityResult.reasoning}${
            securityResult.concerns.length > 0
              ? ` Specific concerns: ${securityResult.concerns.join(", ")}`
              : ""
          }`,
          400
        );

        // Add validation result details to the error
        (detailedError as any).validationResult = {
          reasoning: securityResult.reasoning,
          confidence: securityResult.confidence,
          concerns: securityResult.concerns,
        };

        throw detailedError;
      }

      console.log(
        `[Quiz Service] Quiz update approved by AI security check (confidence: ${securityResult.confidence}%)`
      );
    } else if (!isCurrentlyPublic && !willBePublic) {
      console.log(
        `[Quiz Service] Quiz is private - skipping AI security validation`
      );
    }
  } else {
    console.log(
      `[Quiz Service] Metadata-only update (no content validation needed)`
    );
  }

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
 * Update a quiz with complete questions and options
 * This function validates the content and replaces all questions/options
 * When editing an AI-generated quiz, it becomes a manual quiz
 */
export async function updateQuizWithQuestions(
  quizId: string,
  userId: string,
  input: UpdateQuizWithQuestionsInput
): Promise<QuizWithQuestions> {
  try {
    console.log(
      `[Quiz Service] Updating quiz ${quizId} with questions for user ${userId}`
    );

    // First, verify the user owns the quiz
    const { data: existingQuiz, error: quizError } = await supabase
      .from("quizzes")
      .select("user_id, is_ai_generated")
      .eq("id", quizId)
      .eq("user_id", userId)
      .single();

    if (quizError || !existingQuiz) {
      throw new AppError("Quiz not found or access denied", 404);
    }

    // Prepare content for validation
    const contentForValidation: QuizContentForValidation = {
      title: input.title,
      description: input.description,
      questions: input.questions.map((q) => ({
        question_text: q.question_text,
        options: q.options.map((opt) => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        })),
      })),
    };

    // Check if quiz will be public - only validate public quizzes
    const willBePublic = input.is_public;

    // Apply AI security validation only if quiz will be public
    if (env.BYPASS_CHECKS !== "true" && willBePublic) {
      console.log(
        `[Quiz Service] Quiz will be public - performing AI security validation`
      );

      const securityResult = await validateQuizContent(contentForValidation);

      if (!securityResult.isApproved) {
        console.log(
          `[Quiz Service] Quiz update rejected by AI security check: ${securityResult.reasoning}`
        );

        const detailedError = new AppError(
          `Quiz content was rejected: ${securityResult.reasoning}${
            securityResult.concerns.length > 0
              ? ` Specific concerns: ${securityResult.concerns.join(", ")}`
              : ""
          }`,
          400
        );

        (detailedError as any).validationResult = {
          reasoning: securityResult.reasoning,
          confidence: securityResult.confidence,
          concerns: securityResult.concerns,
        };

        throw detailedError;
      }

      console.log(
        `[Quiz Service] Quiz update approved by AI security validation (confidence: ${securityResult.confidence}%)`
      );
    } else if (!willBePublic) {
      console.log(
        `[Quiz Service] Quiz is private - skipping AI security validation`
      );
    }

    // Start transaction by updating the quiz metadata
    // When editing, the quiz becomes manual and loses AI-generated status
    const { data: updatedQuiz, error: updateError } = await supabase
      .from("quizzes")
      .update({
        title: input.title,
        description: input.description,
        difficulty: input.difficulty,
        is_public: input.is_public,
        is_ai_generated: false, // Loses AI-generated status when edited
        is_manual: true, // Becomes manual quiz
        updated_at: new Date().toISOString(),
      })
      .eq("id", quizId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError || !updatedQuiz) {
      throw new AppError(`Failed to update quiz: ${updateError?.message}`, 500);
    }

    console.log(`[Quiz Service] Updated quiz metadata: ${updatedQuiz.id}`);

    // Delete all existing questions (this will cascade delete options)
    const { error: deleteError } = await supabase
      .from("questions")
      .delete()
      .eq("quiz_id", quizId);

    if (deleteError) {
      throw new AppError(
        `Failed to delete existing questions: ${deleteError.message}`,
        500
      );
    }

    console.log(`[Quiz Service] Deleted existing questions for quiz ${quizId}`);

    // Insert new questions and options
    const questions: Question[] = [];

    for (const [index, inputQuestion] of input.questions.entries()) {
      console.log(
        `[Quiz Service] Creating question ${index + 1}/${input.questions.length}`
      );

      // Create the question
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert({
          quiz_id: quizId,
          question_text: inputQuestion.question_text,
          question_type: inputQuestion.question_type,
          order_index: inputQuestion.order_index,
        })
        .select()
        .single();

      if (questionError || !questionData) {
        throw new AppError(
          `Failed to create question ${index + 1}: ${questionError?.message}`,
          500
        );
      }

      // Create options for the question
      const optionsToInsert = inputQuestion.options.map((option) => ({
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
      `[Quiz Service] Successfully updated quiz with ${questions.length} questions`
    );

    return {
      ...updatedQuiz,
      questions,
    };
  } catch (error) {
    console.error("[Quiz Service] Error updating quiz with questions:", error);
    throw error;
  }
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
  return quizzes.map((quiz: any) => {
    const stats = statsMap.get(quiz.id) || { attempts: 0, totalPercentage: 0 };
    const attempts = stats.attempts;
    const average_score =
      attempts > 0 ? Number((stats.totalPercentage / attempts).toFixed(1)) : 0;

    // Add question count
    const questionCount = questionCountMap.get(quiz.id) || 0;

    return {
      ...quiz,
      attempts,
      average_score,
      question_count: questionCount,
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

  // Fetch attempts
  const { data: attemptsData, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select("id, user_id, score, percentage, completed_at")
    .eq("quiz_id", quizId)
    .order("completed_at", { ascending: false });

  if (attemptsError) {
    throw new AppError(
      `Failed to fetch quiz attempts: ${attemptsError.message}`,
      500
    );
  }

  // Get user profiles for all attempt users
  const userIds = [...new Set((attemptsData || []).map((a) => a.user_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", userIds);

  if (profilesError) {
    throw new AppError(
      `Failed to fetch user profiles: ${profilesError.message}`,
      500
    );
  }

  // Create a map of user profiles for quick lookup
  const profilesMap = new Map();
  (profiles || []).forEach((profile) => {
    profilesMap.set(profile.id, profile);
  });

  // Map to summary objects
  return (attemptsData || []).map((attempt: any) => {
    const profile = profilesMap.get(attempt.user_id) || {};
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

/**
 * Get a quiz by ID for preview with creator information
 * Unlike getQuizById, this includes answers and creator details
 */
export async function getQuizByIdForPreview(
  quizId: string,
  userId?: string
): Promise<
  | (QuizWithQuestions & { creator: { name: string; avatar_url?: string } })
  | null
> {
  console.log(
    `[Quiz Service] Fetching quiz ${quizId} for preview by user ${userId || "anonymous"}`
  );

  // Get the quiz first
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

  // Check access permissions - only owner can preview
  if (!userId || quizData.user_id !== userId) {
    console.log(
      `[Quiz Service] Access denied to preview quiz ${quizId} for user ${userId}`
    );
    throw new AppError("Access denied to this quiz", 403);
  }

  // Get the creator profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", quizData.user_id)
    .single();

  if (profileError) {
    console.log(
      `[Quiz Service] Warning: Could not fetch profile for user ${quizData.user_id}:`,
      profileError
    );
  }

  // Get questions with options (including correct answers)
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
    `[Quiz Service] Successfully fetched quiz ${quizId} for preview with ${questionsData?.length || 0} questions`
  );

  // Extract creator profile
  const creator = profileData || { name: "Unknown", avatar_url: null };

  return {
    ...quizData,
    creator,
    questions: questionsData || [],
  };
}

/**
 * Get comprehensive statistics about public quizzes
 */
export interface PublicQuizStats {
  totalQuizzes: number;
  quizzesByType: {
    aiGenerated: number;
    humanCreated: number;
  };
  recentActivity: {
    addedLast24Hours: number;
    addedLastWeek: number;
  };
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  engagement: {
    totalAttempts: number;
    averageAttemptsPerQuiz: number;
    averageQuestionsPerQuiz: number;
  };
}

export async function getPublicQuizStats(): Promise<PublicQuizStats> {
  console.log("[Quiz Service] Fetching public quiz statistics");

  try {
    // Get all public quizzes
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("id, is_ai_generated, difficulty, created_at")
      .eq("is_public", true);

    if (quizzesError) {
      throw new AppError(
        `Failed to fetch public quizzes for stats: ${quizzesError.message}`,
        500
      );
    }

    const totalQuizzes = quizzes?.length || 0;
    if (totalQuizzes === 0) {
      return {
        totalQuizzes: 0,
        quizzesByType: { aiGenerated: 0, humanCreated: 0 },
        recentActivity: { addedLast24Hours: 0, addedLastWeek: 0 },
        difficulty: { easy: 0, medium: 0, hard: 0 },
        engagement: {
          totalAttempts: 0,
          averageAttemptsPerQuiz: 0,
          averageQuestionsPerQuiz: 0,
        },
      };
    }

    // Calculate time boundaries
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Process quiz data
    const quizzesByType = { aiGenerated: 0, humanCreated: 0 };
    const difficulty = { easy: 0, medium: 0, hard: 0 };
    const recentActivity = { addedLast24Hours: 0, addedLastWeek: 0 };

    quizzes.forEach((quiz) => {
      // Count by type
      if (quiz.is_ai_generated) {
        quizzesByType.aiGenerated++;
      } else {
        quizzesByType.humanCreated++;
      }

      // Count by difficulty
      difficulty[quiz.difficulty as keyof typeof difficulty]++;

      // Count recent activity
      const createdAt = new Date(quiz.created_at);
      if (createdAt > last24Hours) {
        recentActivity.addedLast24Hours++;
      }
      if (createdAt > lastWeek) {
        recentActivity.addedLastWeek++;
      }
    });

    // Get question count statistics
    const quizIds = quizzes.map((quiz) => quiz.id);
    const { data: questionCounts, error: questionCountsError } = await supabase
      .from("questions")
      .select("quiz_id")
      .in("quiz_id", quizIds);

    if (questionCountsError) {
      throw new AppError(
        `Failed to fetch question counts for stats: ${questionCountsError.message}`,
        500
      );
    }

    // Calculate average questions per quiz
    const totalQuestions = questionCounts?.length || 0;
    const averageQuestionsPerQuiz =
      totalQuizzes > 0
        ? Math.round((totalQuestions / totalQuizzes) * 10) / 10
        : 0;

    // Get attempt statistics
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("quiz_id")
      .in("quiz_id", quizIds);

    if (attemptsError) {
      throw new AppError(
        `Failed to fetch attempts for stats: ${attemptsError.message}`,
        500
      );
    }

    const totalAttempts = attempts?.length || 0;
    const averageAttemptsPerQuiz =
      totalQuizzes > 0
        ? Math.round((totalAttempts / totalQuizzes) * 10) / 10
        : 0;

    const stats: PublicQuizStats = {
      totalQuizzes,
      quizzesByType,
      recentActivity,
      difficulty,
      engagement: {
        totalAttempts,
        averageAttemptsPerQuiz,
        averageQuestionsPerQuiz,
      },
    };

    console.log(
      `[Quiz Service] Successfully calculated public quiz stats: ${totalQuizzes} total quizzes, ${totalAttempts} total attempts`
    );

    return stats;
  } catch (error) {
    console.error("[Quiz Service] Error fetching public quiz stats:", error);
    throw error;
  }
}

// =============================================
// QUIZ ANALYTICS
// =============================================

export interface QuizAnalytics {
  overview: {
    totalAttempts: number;
    uniqueUsers: number;
    averageScore: number;
    averageTimeSpent: number;
    completionRate: number;
    highestScore: number;
    lowestScore: number;
  };
  performance: {
    scoreDistribution: {
      range: string;
      count: number;
      percentage: number;
    }[];
    difficultyRating: {
      perceived: "easy" | "medium" | "hard";
      actualDifficulty: number;
    };
  };
  engagement: {
    attemptsOverTime: {
      date: string;
      count: number;
    }[];
    topPerformers: {
      userId: string;
      userName: string | null;
      userAvatarUrl: string | null;
      score: number;
      percentage: number;
      completedAt: string;
    }[];
    recentActivity: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
    };
  };
  questions: {
    questionId: string;
    questionText: string;
    orderIndex: number;
    correctRate: number;
    totalAnswers: number;
    difficulty: "easy" | "medium" | "hard";
    optionAnalysis: {
      optionId: string;
      optionText: string;
      isCorrect: boolean;
      selectedCount: number;
      percentage: number;
    }[];
  }[];
}

export async function getQuizAnalytics(
  quizId: string,
  ownerId: string
): Promise<QuizAnalytics> {
  console.log(
    `[Quiz Service] Getting analytics for quiz ${quizId} by owner ${ownerId}`
  );

  // Verify quiz ownership
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .eq("user_id", ownerId)
    .single();

  if (quizError || !quiz) {
    throw new AppError("Quiz not found or access denied", 404);
  }

  // Get quiz questions with options
  const { data: questions, error: questionsError } = await supabase
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

  // Get all attempts for this quiz
  const { data: attempts, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", quizId)
    .order("completed_at", { ascending: false });

  if (attemptsError) {
    throw new AppError(
      `Failed to fetch attempts: ${attemptsError.message}`,
      500
    );
  }

  // Get user profiles for all attempt users
  const userIds = [...new Set((attempts || []).map((a) => a.user_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", userIds);

  if (profilesError) {
    throw new AppError(
      `Failed to fetch user profiles: ${profilesError.message}`,
      500
    );
  }

  // Create a map of user profiles for quick lookup
  const profilesMap = new Map();
  (profiles || []).forEach((profile) => {
    profilesMap.set(profile.id, profile);
  });

  // Get all attempt answers
  const attemptIds = (attempts || []).map((a) => a.id);
  const { data: attemptAnswers, error: answersError } = await supabase
    .from("quiz_attempt_answers")
    .select("*")
    .in("attempt_id", attemptIds);

  if (answersError) {
    throw new AppError(
      `Failed to fetch attempt answers: ${answersError.message}`,
      500
    );
  }

  // Calculate overview metrics
  const totalAttempts = attempts?.length || 0;
  const uniqueUsers = new Set((attempts || []).map((a) => a.user_id)).size;
  const averageScore =
    totalAttempts > 0
      ? Number(
          (
            (attempts || []).reduce((sum, a) => sum + a.percentage, 0) /
            totalAttempts
          ).toFixed(1)
        )
      : 0;

  const scores = (attempts || []).map((a) => a.percentage);
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

  // Calculate completion rate (assuming started_at and completed_at are the same for now)
  const completionRate = 100; // Since we only record completed attempts

  // Calculate average time spent (placeholder - would need started_at to be different from completed_at)
  const averageTimeSpent = 0; // Minutes

  // Score distribution
  const scoreDistribution = [
    { range: "0-20%", count: 0, percentage: 0 },
    { range: "21-40%", count: 0, percentage: 0 },
    { range: "41-60%", count: 0, percentage: 0 },
    { range: "61-80%", count: 0, percentage: 0 },
    { range: "81-100%", count: 0, percentage: 0 },
  ];

  scores.forEach((score) => {
    if (score <= 20) scoreDistribution[0].count++;
    else if (score <= 40) scoreDistribution[1].count++;
    else if (score <= 60) scoreDistribution[2].count++;
    else if (score <= 80) scoreDistribution[3].count++;
    else scoreDistribution[4].count++;
  });

  scoreDistribution.forEach((dist) => {
    dist.percentage =
      totalAttempts > 0
        ? Number(((dist.count / totalAttempts) * 100).toFixed(1))
        : 0;
  });

  // Attempts over time (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const attemptsOverTime: { date: string; count: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const count = (attempts || []).filter((a) =>
      a.completed_at.startsWith(dateStr)
    ).length;
    attemptsOverTime.push({ date: dateStr, count });
  }

  // Top performers (top 10)
  const topPerformers = (attempts || [])
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10)
    .map((attempt) => {
      const profile = profilesMap.get(attempt.user_id);
      return {
        userId: attempt.user_id,
        userName: profile?.name || null,
        userAvatarUrl: profile?.avatar_url || null,
        score: attempt.score,
        percentage: attempt.percentage,
        completedAt: attempt.completed_at,
      };
    });

  // Recent activity
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentActivity = {
    last24Hours: (attempts || []).filter(
      (a) => new Date(a.completed_at) > last24Hours
    ).length,
    last7Days: (attempts || []).filter(
      (a) => new Date(a.completed_at) > last7Days
    ).length,
    last30Days: (attempts || []).filter(
      (a) => new Date(a.completed_at) > last30Days
    ).length,
  };

  // Question-level analysis
  const questionAnalysis = (questions || []).map((question) => {
    const questionAnswers = (attemptAnswers || []).filter(
      (a) => a.question_id === question.id
    );
    const totalAnswers = questionAnswers.length;
    const correctAnswers = questionAnswers.filter((a) => a.is_correct).length;
    const correctRate =
      totalAnswers > 0
        ? Number(((correctAnswers / totalAnswers) * 100).toFixed(1))
        : 0;

    // Determine difficulty based on correct rate
    let difficulty: "easy" | "medium" | "hard" = "medium";
    if (correctRate >= 80) difficulty = "easy";
    else if (correctRate <= 40) difficulty = "hard";

    // Option analysis
    const optionAnalysis = (question.question_options || []).map(
      (option: any) => {
        const selectedCount = questionAnswers.filter(
          (a) => a.selected_option_id === option.id
        ).length;
        const percentage =
          totalAnswers > 0
            ? Number(((selectedCount / totalAnswers) * 100).toFixed(1))
            : 0;

        return {
          optionId: option.id,
          optionText: option.option_text,
          isCorrect: option.is_correct,
          selectedCount,
          percentage,
        };
      }
    );

    return {
      questionId: question.id,
      questionText: question.question_text,
      orderIndex: question.order_index,
      correctRate,
      totalAnswers,
      difficulty,
      optionAnalysis,
    };
  });

  // Calculate actual difficulty rating
  const overallCorrectRate =
    questionAnalysis.length > 0
      ? questionAnalysis.reduce((sum, q) => sum + q.correctRate, 0) /
        questionAnalysis.length
      : 0;

  let actualDifficulty: number;
  if (overallCorrectRate >= 80)
    actualDifficulty = 1; // Easy
  else if (overallCorrectRate >= 60)
    actualDifficulty = 2; // Medium
  else if (overallCorrectRate >= 40)
    actualDifficulty = 3; // Hard
  else actualDifficulty = 4; // Very Hard

  const analytics: QuizAnalytics = {
    overview: {
      totalAttempts,
      uniqueUsers,
      averageScore,
      averageTimeSpent,
      completionRate,
      highestScore,
      lowestScore,
    },
    performance: {
      scoreDistribution,
      difficultyRating: {
        perceived: quiz.difficulty,
        actualDifficulty,
      },
    },
    engagement: {
      attemptsOverTime,
      topPerformers,
      recentActivity,
    },
    questions: questionAnalysis,
  };

  console.log(
    `[Quiz Service] Successfully calculated analytics for quiz ${quizId}: ${totalAttempts} attempts, ${uniqueUsers} unique users`
  );

  return analytics;
}

/**
 * Analytics for all quizzes created by a user
 */
export interface CreatorAnalytics {
  overview: {
    totalQuizzes: number;
    totalAttempts: number;
    totalUniqueUsers: number;
    averageScore: number;
    averageAttemptsPerQuiz: number;
    averageQuestionsPerQuiz: number;
    totalQuestions: number;
  };
  breakdown: {
    byDifficulty: {
      easy: { count: number; avgScore: number; attempts: number };
      medium: { count: number; avgScore: number; attempts: number };
      hard: { count: number; avgScore: number; attempts: number };
    };
    byType: {
      aiGenerated: { count: number; avgScore: number; attempts: number };
      humanCreated: { count: number; avgScore: number; attempts: number };
    };
  };
  performance: {
    topPerformingQuizzes: {
      quizId: string;
      title: string;
      avgScore: number;
      attempts: number;
      uniqueUsers: number;
      difficulty: string;
      createdAt: string;
    }[];
    scoreDistribution: {
      range: string;
      count: number;
      percentage: number;
    }[];
  };
  engagement: {
    creationTrend: {
      date: string;
      count: number;
    }[];
    attemptsTrend: {
      date: string;
      count: number;
    }[];
    recentActivity: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
    };
  };
  topQuizzes: {
    mostPopular: {
      quizId: string;
      title: string;
      attempts: number;
      uniqueUsers: number;
      avgScore: number;
    }[];
    highestRated: {
      quizId: string;
      title: string;
      avgScore: number;
      attempts: number;
      difficulty: string;
    }[];
  };
}

/**
 * Analytics for all quizzes attempted by a user
 */
export interface ParticipantAnalytics {
  overview: {
    totalAttempts: number;
    uniqueQuizzes: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    totalTimeSpent: number;
    averageTimePerQuiz: number;
  };
  performance: {
    scoreDistribution: {
      range: string;
      count: number;
      percentage: number;
    }[];
    progressTrend: {
      date: string;
      avgScore: number;
      attempts: number;
    }[];
    strengthsByDifficulty: {
      easy: { attempts: number; avgScore: number; improvement: number };
      medium: { attempts: number; avgScore: number; improvement: number };
      hard: { attempts: number; avgScore: number; improvement: number };
    };
  };
  engagement: {
    activityTrend: {
      date: string;
      attempts: number;
    }[];
    streaks: {
      currentStreak: number;
      longestStreak: number;
      lastActive: string;
    };
    favoriteTopics: {
      topic: string;
      attempts: number;
      avgScore: number;
    }[];
  };
  achievements: {
    perfectScores: number;
    improvementRate: number;
    consistencyScore: number;
    challenges: {
      name: string;
      description: string;
      completed: boolean;
      progress: number;
    }[];
  };
  recentAttempts: {
    quizId: string;
    quizTitle: string;
    score: number;
    percentage: number;
    difficulty: string;
    completedAt: string;
    creatorName: string | null;
  }[];
}

/**
 * Get comprehensive analytics for all quizzes created by a user
 */
export async function getCreatorAnalytics(
  userId: string
): Promise<CreatorAnalytics> {
  console.log(`[Quiz Service] Getting creator analytics for user ${userId}`);

  // Get all quizzes created by the user
  const { data: quizzes, error: quizzesError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (quizzesError) {
    throw new AppError(
      `Failed to fetch user quizzes: ${quizzesError.message}`,
      500
    );
  }

  const totalQuizzes = quizzes?.length || 0;
  const quizIds = (quizzes || []).map((q) => q.id);

  if (totalQuizzes === 0) {
    // Return empty analytics for users with no quizzes
    return {
      overview: {
        totalQuizzes: 0,
        totalAttempts: 0,
        totalUniqueUsers: 0,
        averageScore: 0,
        averageAttemptsPerQuiz: 0,
        averageQuestionsPerQuiz: 0,
        totalQuestions: 0,
      },
      breakdown: {
        byDifficulty: {
          easy: { count: 0, avgScore: 0, attempts: 0 },
          medium: { count: 0, avgScore: 0, attempts: 0 },
          hard: { count: 0, avgScore: 0, attempts: 0 },
        },
        byType: {
          aiGenerated: { count: 0, avgScore: 0, attempts: 0 },
          humanCreated: { count: 0, avgScore: 0, attempts: 0 },
        },
      },
      performance: {
        topPerformingQuizzes: [],
        scoreDistribution: [
          { range: "0-20%", count: 0, percentage: 0 },
          { range: "21-40%", count: 0, percentage: 0 },
          { range: "41-60%", count: 0, percentage: 0 },
          { range: "61-80%", count: 0, percentage: 0 },
          { range: "81-100%", count: 0, percentage: 0 },
        ],
      },
      engagement: {
        creationTrend: [],
        attemptsTrend: [],
        recentActivity: {
          last24Hours: 0,
          last7Days: 0,
          last30Days: 0,
        },
      },
      topQuizzes: {
        mostPopular: [],
        highestRated: [],
      },
    };
  }

  // Get all attempts for user's quizzes
  const { data: attempts, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select("*")
    .in("quiz_id", quizIds)
    .order("completed_at", { ascending: false });

  if (attemptsError) {
    throw new AppError(
      `Failed to fetch quiz attempts: ${attemptsError.message}`,
      500
    );
  }

  // Get question counts for each quiz
  const { data: questionCounts, error: questionsError } = await supabase
    .from("questions")
    .select("quiz_id")
    .in("quiz_id", quizIds);

  if (questionsError) {
    throw new AppError(
      `Failed to fetch question counts: ${questionsError.message}`,
      500
    );
  }

  // Calculate question counts per quiz
  const questionCountsMap = new Map();
  (questionCounts || []).forEach((q) => {
    questionCountsMap.set(
      q.quiz_id,
      (questionCountsMap.get(q.quiz_id) || 0) + 1
    );
  });

  // Calculate overview metrics
  const totalAttempts = attempts?.length || 0;
  const totalUniqueUsers = new Set((attempts || []).map((a) => a.user_id)).size;
  const averageScore =
    totalAttempts > 0
      ? Number(
          (
            (attempts || []).reduce((sum, a) => sum + a.percentage, 0) /
            totalAttempts
          ).toFixed(1)
        )
      : 0;
  const averageAttemptsPerQuiz =
    totalQuizzes > 0 ? Number((totalAttempts / totalQuizzes).toFixed(1)) : 0;
  const totalQuestions = Array.from(questionCountsMap.values()).reduce(
    (sum, count) => sum + count,
    0
  );
  const averageQuestionsPerQuiz =
    totalQuizzes > 0 ? Number((totalQuestions / totalQuizzes).toFixed(1)) : 0;

  // Breakdown by difficulty
  const difficultyBreakdown = {
    easy: { count: 0, avgScore: 0, attempts: 0 },
    medium: { count: 0, avgScore: 0, attempts: 0 },
    hard: { count: 0, avgScore: 0, attempts: 0 },
  };

  (quizzes || []).forEach((quiz) => {
    const difficulty = quiz.difficulty as "easy" | "medium" | "hard";
    difficultyBreakdown[difficulty].count++;
    const quizAttempts = (attempts || []).filter((a) => a.quiz_id === quiz.id);
    difficultyBreakdown[difficulty].attempts += quizAttempts.length;
    if (quizAttempts.length > 0) {
      const avgScore =
        quizAttempts.reduce((sum, a) => sum + a.percentage, 0) /
        quizAttempts.length;
      difficultyBreakdown[difficulty].avgScore = Number(
        ((difficultyBreakdown[difficulty].avgScore + avgScore) / 2).toFixed(1)
      );
    }
  });

  // Breakdown by type
  const typeBreakdown = {
    aiGenerated: { count: 0, avgScore: 0, attempts: 0 },
    humanCreated: { count: 0, avgScore: 0, attempts: 0 },
  };

  (quizzes || []).forEach((quiz) => {
    const type = quiz.is_manual ? "humanCreated" : "aiGenerated";
    typeBreakdown[type].count++;
    const quizAttempts = (attempts || []).filter((a) => a.quiz_id === quiz.id);
    typeBreakdown[type].attempts += quizAttempts.length;
    if (quizAttempts.length > 0) {
      const avgScore =
        quizAttempts.reduce((sum, a) => sum + a.percentage, 0) /
        quizAttempts.length;
      typeBreakdown[type].avgScore = Number(
        ((typeBreakdown[type].avgScore + avgScore) / 2).toFixed(1)
      );
    }
  });

  // Score distribution across all attempts
  const scoreDistribution = [
    { range: "0-20%", count: 0, percentage: 0 },
    { range: "21-40%", count: 0, percentage: 0 },
    { range: "41-60%", count: 0, percentage: 0 },
    { range: "61-80%", count: 0, percentage: 0 },
    { range: "81-100%", count: 0, percentage: 0 },
  ];

  (attempts || []).forEach((attempt) => {
    const score = attempt.percentage;
    if (score <= 20) scoreDistribution[0].count++;
    else if (score <= 40) scoreDistribution[1].count++;
    else if (score <= 60) scoreDistribution[2].count++;
    else if (score <= 80) scoreDistribution[3].count++;
    else scoreDistribution[4].count++;
  });

  scoreDistribution.forEach((dist) => {
    dist.percentage =
      totalAttempts > 0
        ? Number(((dist.count / totalAttempts) * 100).toFixed(1))
        : 0;
  });

  // Top performing quizzes
  const quizStats = (quizzes || []).map((quiz) => {
    const quizAttempts = (attempts || []).filter((a) => a.quiz_id === quiz.id);
    const avgScore =
      quizAttempts.length > 0
        ? Number(
            (
              quizAttempts.reduce((sum, a) => sum + a.percentage, 0) /
              quizAttempts.length
            ).toFixed(1)
          )
        : 0;
    const uniqueUsers = new Set(quizAttempts.map((a) => a.user_id)).size;

    return {
      quizId: quiz.id,
      title: quiz.title,
      avgScore,
      attempts: quizAttempts.length,
      uniqueUsers,
      difficulty: quiz.difficulty,
      createdAt: quiz.created_at,
    };
  });

  const topPerformingQuizzes = quizStats
    .filter((q) => q.attempts > 0)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  // Creation and attempts trends (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const creationTrend: { date: string; count: number }[] = [];
  const attemptsTrend: { date: string; count: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];

    const quizzesCreated = (quizzes || []).filter((q) =>
      q.created_at.startsWith(dateStr)
    ).length;

    const attemptsOnDate = (attempts || []).filter((a) =>
      a.completed_at.startsWith(dateStr)
    ).length;

    creationTrend.push({ date: dateStr, count: quizzesCreated });
    attemptsTrend.push({ date: dateStr, count: attemptsOnDate });
  }

  // Recent activity
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentActivity = {
    last24Hours: (attempts || []).filter(
      (a) => new Date(a.completed_at) > last24Hours
    ).length,
    last7Days: (attempts || []).filter(
      (a) => new Date(a.completed_at) > last7Days
    ).length,
    last30Days: (attempts || []).filter(
      (a) => new Date(a.completed_at) > last30Days
    ).length,
  };

  // Top quizzes (most popular and highest rated)
  const mostPopular = quizStats
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 5)
    .map((q) => ({
      quizId: q.quizId,
      title: q.title,
      attempts: q.attempts,
      uniqueUsers: q.uniqueUsers,
      avgScore: q.avgScore,
    }));

  const highestRated = quizStats
    .filter((q) => q.attempts >= 3) // Only include quizzes with at least 3 attempts
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5)
    .map((q) => ({
      quizId: q.quizId,
      title: q.title,
      avgScore: q.avgScore,
      attempts: q.attempts,
      difficulty: q.difficulty,
    }));

  const analytics: CreatorAnalytics = {
    overview: {
      totalQuizzes,
      totalAttempts,
      totalUniqueUsers,
      averageScore,
      averageAttemptsPerQuiz,
      averageQuestionsPerQuiz,
      totalQuestions,
    },
    breakdown: {
      byDifficulty: difficultyBreakdown,
      byType: typeBreakdown,
    },
    performance: {
      topPerformingQuizzes,
      scoreDistribution,
    },
    engagement: {
      creationTrend,
      attemptsTrend,
      recentActivity,
    },
    topQuizzes: {
      mostPopular,
      highestRated,
    },
  };

  console.log(
    `[Quiz Service] Successfully calculated creator analytics for user ${userId}: ${totalQuizzes} quizzes, ${totalAttempts} total attempts`
  );
  return analytics;
}

/**
 * Get comprehensive analytics for all quizzes attempted by a user
 */
export async function getParticipantAnalytics(
  userId: string
): Promise<ParticipantAnalytics> {
  console.log(
    `[Quiz Service] Getting participant analytics for user ${userId}`
  );

  // Get all attempts by the user
  const { data: attempts, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select(
      `
      *,
      quizzes (
        id,
        title,
        difficulty,
        user_id,
        original_prompt
      )
    `
    )
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (attemptsError) {
    throw new AppError(
      `Failed to fetch user attempts: ${attemptsError.message}`,
      500
    );
  }

  const totalAttempts = attempts?.length || 0;

  if (totalAttempts === 0) {
    // Return empty analytics for users with no attempts
    return {
      overview: {
        totalAttempts: 0,
        uniqueQuizzes: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalTimeSpent: 0,
        averageTimePerQuiz: 0,
      },
      performance: {
        scoreDistribution: [
          { range: "0-20%", count: 0, percentage: 0 },
          { range: "21-40%", count: 0, percentage: 0 },
          { range: "41-60%", count: 0, percentage: 0 },
          { range: "61-80%", count: 0, percentage: 0 },
          { range: "81-100%", count: 0, percentage: 0 },
        ],
        progressTrend: [],
        strengthsByDifficulty: {
          easy: { attempts: 0, avgScore: 0, improvement: 0 },
          medium: { attempts: 0, avgScore: 0, improvement: 0 },
          hard: { attempts: 0, avgScore: 0, improvement: 0 },
        },
      },
      engagement: {
        activityTrend: [],
        streaks: {
          currentStreak: 0,
          longestStreak: 0,
          lastActive: "",
        },
        favoriteTopics: [],
      },
      achievements: {
        perfectScores: 0,
        improvementRate: 0,
        consistencyScore: 0,
        challenges: [],
      },
      recentAttempts: [],
    };
  }

  // Get creator names for recent attempts
  const creatorIds = [
    ...new Set((attempts || []).map((a) => a.quizzes?.user_id).filter(Boolean)),
  ];
  const { data: creators, error: creatorsError } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", creatorIds);

  if (creatorsError) {
    console.warn(`Failed to fetch creator profiles: ${creatorsError.message}`);
  }

  const creatorsMap = new Map();
  (creators || []).forEach((creator) => {
    creatorsMap.set(creator.id, creator.name);
  });

  // Calculate overview metrics
  const uniqueQuizzes = new Set((attempts || []).map((a) => a.quiz_id)).size;
  const scores = (attempts || []).map((a) => a.percentage);
  const averageScore = Number(
    (scores.reduce((sum, score) => sum + score, 0) / totalAttempts).toFixed(1)
  );
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  // Time calculations (placeholder for now, would need proper time tracking)
  const totalTimeSpent = (attempts || []).reduce(
    (sum, a) => sum + (a.time_spent_seconds || 0),
    0
  );
  const averageTimePerQuiz =
    totalAttempts > 0 ? Math.round(totalTimeSpent / totalAttempts) : 0;

  // Score distribution
  const scoreDistribution = [
    { range: "0-20%", count: 0, percentage: 0 },
    { range: "21-40%", count: 0, percentage: 0 },
    { range: "41-60%", count: 0, percentage: 0 },
    { range: "61-80%", count: 0, percentage: 0 },
    { range: "81-100%", count: 0, percentage: 0 },
  ];

  scores.forEach((score) => {
    if (score <= 20) scoreDistribution[0].count++;
    else if (score <= 40) scoreDistribution[1].count++;
    else if (score <= 60) scoreDistribution[2].count++;
    else if (score <= 80) scoreDistribution[3].count++;
    else scoreDistribution[4].count++;
  });

  scoreDistribution.forEach((dist) => {
    dist.percentage = Number(((dist.count / totalAttempts) * 100).toFixed(1));
  });

  // Progress trend (last 30 days)
  const now = new Date();
  const progressTrend: { date: string; avgScore: number; attempts: number }[] =
    [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];

    const dayAttempts = (attempts || []).filter((a) =>
      a.completed_at.startsWith(dateStr)
    );
    const avgScore =
      dayAttempts.length > 0
        ? Number(
            (
              dayAttempts.reduce((sum, a) => sum + a.percentage, 0) /
              dayAttempts.length
            ).toFixed(1)
          )
        : 0;

    progressTrend.push({
      date: dateStr,
      avgScore,
      attempts: dayAttempts.length,
    });
  }

  // Strengths by difficulty
  const strengthsByDifficulty = {
    easy: { attempts: 0, avgScore: 0, improvement: 0 },
    medium: { attempts: 0, avgScore: 0, improvement: 0 },
    hard: { attempts: 0, avgScore: 0, improvement: 0 },
  };

  (attempts || []).forEach((attempt) => {
    const difficulty = attempt.quizzes?.difficulty as
      | "easy"
      | "medium"
      | "hard"
      | undefined;
    if (difficulty && strengthsByDifficulty[difficulty]) {
      strengthsByDifficulty[difficulty].attempts++;
    }
  });

  // Calculate average scores and improvements for each difficulty
  (
    Object.keys(strengthsByDifficulty) as Array<"easy" | "medium" | "hard">
  ).forEach((difficulty) => {
    const difficultyAttempts = (attempts || []).filter(
      (a) => a.quizzes?.difficulty === difficulty
    );
    if (difficultyAttempts.length > 0) {
      const avgScore =
        difficultyAttempts.reduce((sum, a) => sum + a.percentage, 0) /
        difficultyAttempts.length;
      strengthsByDifficulty[difficulty].avgScore = Number(avgScore.toFixed(1));

      // Calculate improvement (compare first half vs second half of attempts)
      if (difficultyAttempts.length >= 4) {
        const half = Math.floor(difficultyAttempts.length / 2);
        const firstHalf = difficultyAttempts.slice(-half);
        const secondHalf = difficultyAttempts.slice(0, half);

        const firstAvg =
          firstHalf.reduce((sum, a) => sum + a.percentage, 0) /
          firstHalf.length;
        const secondAvg =
          secondHalf.reduce((sum, a) => sum + a.percentage, 0) /
          secondHalf.length;

        strengthsByDifficulty[difficulty].improvement = Number(
          (secondAvg - firstAvg).toFixed(1)
        );
      }
    }
  });

  // Activity trend
  const activityTrend: { date: string; attempts: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const dayAttempts = (attempts || []).filter((a) =>
      a.completed_at.startsWith(dateStr)
    ).length;
    activityTrend.push({ date: dateStr, attempts: dayAttempts });
  }

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastActiveDate = "";

  if (attempts && attempts.length > 0) {
    lastActiveDate = attempts[0].completed_at.split("T")[0];

    // Sort attempts by date to calculate streaks
    const sortedDates = [
      ...new Set((attempts || []).map((a) => a.completed_at.split("T")[0])),
    ].sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (
        i === 0 ||
        new Date(sortedDates[i]).getTime() -
          new Date(sortedDates[i - 1]).getTime() <=
          86400000 * 2
      ) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Current streak (consecutive days from today backwards)
    const today = new Date().toISOString().split("T")[0];
    const recentDates = sortedDates.reverse();

    if (
      recentDates[0] === today ||
      new Date(today).getTime() - new Date(recentDates[0]).getTime() <= 86400000
    ) {
      currentStreak = 1;
      for (let i = 1; i < recentDates.length; i++) {
        if (
          new Date(recentDates[i - 1]).getTime() -
            new Date(recentDates[i]).getTime() <=
          86400000 * 2
        ) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  // Favorite topics (extract from quiz prompts/titles)
  const topicMap = new Map();
  (attempts || []).forEach((attempt) => {
    const prompt =
      attempt.quizzes?.original_prompt || attempt.quizzes?.title || "";
    // Simple topic extraction - look for common keywords
    const topics = prompt
      .toLowerCase()
      .match(
        /\b(science|math|history|geography|literature|technology|sports|music|art|programming|business|psychology|philosophy|politics|economics|biology|chemistry|physics|english|spanish|french|german)\b/g
      );

    if (topics) {
      topics.forEach((topic: string) => {
        const existing = topicMap.get(topic) || { attempts: 0, totalScore: 0 };
        existing.attempts++;
        existing.totalScore += attempt.percentage;
        topicMap.set(topic, existing);
      });
    }
  });

  const favoriteTopics = Array.from(topicMap.entries())
    .map(([topic, data]) => ({
      topic,
      attempts: data.attempts,
      avgScore: Number((data.totalScore / data.attempts).toFixed(1)),
    }))
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 5);

  // Achievements
  const perfectScores = (attempts || []).filter(
    (a) => a.percentage === 100
  ).length;

  // Calculate improvement rate (compare first 10 attempts vs last 10)
  let improvementRate = 0;
  if (totalAttempts >= 10) {
    const first10 = (attempts || []).slice(-10);
    const last10 = (attempts || []).slice(0, 10);

    const first10Avg = first10.reduce((sum, a) => sum + a.percentage, 0) / 10;
    const last10Avg = last10.reduce((sum, a) => sum + a.percentage, 0) / 10;

    improvementRate = Number((last10Avg - first10Avg).toFixed(1));
  }

  // Consistency score (1 - coefficient of variation)
  const scoreVariation =
    scores.length > 1
      ? Math.sqrt(
          scores.reduce(
            (sum, score) => sum + Math.pow(score - averageScore, 2),
            0
          ) / scores.length
        )
      : 0;
  const consistencyScore =
    averageScore > 0
      ? Math.max(
          0,
          Number((100 - (scoreVariation / averageScore) * 100).toFixed(1))
        )
      : 0;

  // Challenges (gamification elements)
  const challenges = [
    {
      name: "Perfect Score Master",
      description: "Get 3 perfect scores",
      completed: perfectScores >= 3,
      progress: Math.min(100, (perfectScores / 3) * 100),
    },
    {
      name: "Quiz Explorer",
      description: "Attempt 25 different quizzes",
      completed: uniqueQuizzes >= 25,
      progress: Math.min(100, (uniqueQuizzes / 25) * 100),
    },
    {
      name: "Consistency Champion",
      description: "Achieve 80%+ consistency score",
      completed: consistencyScore >= 80,
      progress: Math.min(100, (consistencyScore / 80) * 100),
    },
    {
      name: "Streak Warrior",
      description: "Maintain a 7-day streak",
      completed: longestStreak >= 7,
      progress: Math.min(100, (longestStreak / 7) * 100),
    },
  ];

  // Recent attempts (last 10)
  const recentAttempts = (attempts || []).slice(0, 10).map((attempt) => ({
    quizId: attempt.quiz_id,
    quizTitle: attempt.quizzes?.title || "Unknown Quiz",
    score: attempt.score,
    percentage: attempt.percentage,
    difficulty: attempt.quizzes?.difficulty || "medium",
    completedAt: attempt.completed_at,
    creatorName: creatorsMap.get(attempt.quizzes?.user_id) || null,
  }));

  const analytics: ParticipantAnalytics = {
    overview: {
      totalAttempts,
      uniqueQuizzes,
      averageScore,
      highestScore,
      lowestScore,
      totalTimeSpent,
      averageTimePerQuiz,
    },
    performance: {
      scoreDistribution,
      progressTrend,
      strengthsByDifficulty,
    },
    engagement: {
      activityTrend,
      streaks: {
        currentStreak,
        longestStreak,
        lastActive: lastActiveDate,
      },
      favoriteTopics,
    },
    achievements: {
      perfectScores,
      improvementRate,
      consistencyScore,
      challenges,
    },
    recentAttempts,
  };

  console.log(
    `[Quiz Service] Successfully calculated participant analytics for user ${userId}: ${totalAttempts} attempts, ${uniqueQuizzes} unique quizzes`
  );
  return analytics;
}

/**
 * Overview analytics interface for dashboard stats
 */
export interface OverviewAnalytics {
  quizzesCreated: number;
  quizzesAttempted: number;
  averageScore: number;
  totalParticipants: number;
}

/**
 * Get overview analytics for a user (dashboard stats)
 */
export async function getOverviewAnalytics(
  userId: string
): Promise<OverviewAnalytics> {
  console.log(`[Quiz Service] Getting overview analytics for user ${userId}`);

  // Get count of quizzes created by the user
  const { data: createdQuizzes, error: createdError } = await supabase
    .from("quizzes")
    .select("id")
    .eq("user_id", userId);

  if (createdError) {
    throw new AppError(
      `Failed to fetch created quizzes: ${createdError.message}`,
      500
    );
  }

  const quizzesCreated = createdQuizzes?.length || 0;

  // Get all attempts made by the user (for quizzes they attempted)
  const { data: userAttempts, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select("percentage")
    .eq("user_id", userId);

  if (attemptsError) {
    throw new AppError(
      `Failed to fetch user attempts: ${attemptsError.message}`,
      500
    );
  }

  const quizzesAttempted = userAttempts?.length || 0;
  const averageScore =
    quizzesAttempted > 0
      ? Number(
          (
            (userAttempts || []).reduce((sum, a) => sum + a.percentage, 0) /
            quizzesAttempted
          ).toFixed(1)
        )
      : 0;

  // Get total unique participants for user's quizzes
  let totalParticipants = 0;
  if (quizzesCreated > 0) {
    const createdQuizIds = (createdQuizzes || []).map((q) => q.id);

    const { data: participantsData, error: participantsError } = await supabase
      .from("quiz_attempts")
      .select("user_id")
      .in("quiz_id", createdQuizIds);

    if (participantsError) {
      throw new AppError(
        `Failed to fetch participants: ${participantsError.message}`,
        500
      );
    }

    totalParticipants = new Set((participantsData || []).map((p) => p.user_id))
      .size;
  }

  const analytics: OverviewAnalytics = {
    quizzesCreated,
    quizzesAttempted,
    averageScore,
    totalParticipants,
  };

  console.log(
    `[Quiz Service] Overview analytics for user ${userId}: ${quizzesCreated} created, ${quizzesAttempted} attempted, ${averageScore}% avg score, ${totalParticipants} participants`
  );

  return analytics;
}

// =============================================
// AI ASSISTANCE SERVICES FOR ADVANCED QUIZ EDITING
// =============================================

export async function generateQuestionsForQuiz(
  quizId: string | null,
  userId: string,
  count: number,
  context?: QuizContext
): Promise<GeneratedQuestionsResult> {
  console.log(
    `[Quiz Service] Generating ${count} questions for ${quizId ? `quiz ${quizId}` : "prototype"} by user ${userId}`
  );

  let quizContext: QuizContext;

  if (quizId) {
    // Verify user owns the quiz
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("title, description, difficulty, original_prompt")
      .eq("id", quizId)
      .eq("user_id", userId)
      .single();

    if (quizError || !quiz) {
      throw new AppError("Quiz not found or access denied", 404);
    }

    // Get existing questions to provide context
    const { data: existingQuestions, error: questionsError } = await supabase
      .from("questions")
      .select(
        `
        question_text,
        question_options (
          option_text,
          is_correct
        )
      `
      )
      .eq("quiz_id", quizId)
      .order("order_index");

    if (questionsError) {
      throw new AppError(
        `Failed to fetch existing questions: ${questionsError.message}`,
        500
      );
    }

    // Build quiz context
    quizContext = {
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      originalPrompt: quiz.original_prompt || quiz.title,
      existingQuestions:
        existingQuestions?.map((q) => ({
          question_text: q.question_text,
          options: (q.question_options || []).map((opt: any) => ({
            option_text: opt.option_text,
            is_correct: opt.is_correct,
          })),
        })) || [],
    };
  } else {
    // Use provided context for prototype mode
    if (!context) {
      throw new AppError("Context is required for prototype mode", 400);
    }
    quizContext = context;
  }

  // Generate questions using AI
  const result = await generateAdditionalQuestions(quizContext, count);

  console.log(
    `[Quiz Service] Successfully generated ${result.questions.length} questions for ${quizId || "prototype"}`
  );

  return result;
}

export async function enhanceQuizQuestion(
  quizId: string | null,
  userId: string,
  questionText: string,
  context?: QuizContext
): Promise<EnhancedQuestionResult> {
  console.log(
    `[Quiz Service] Enhancing question for ${quizId ? `quiz ${quizId}` : "prototype"} by user ${userId}`
  );

  let quizContext: QuizContext;

  if (quizId) {
    // Verify user owns the quiz
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("title, description, difficulty, original_prompt")
      .eq("id", quizId)
      .eq("user_id", userId)
      .single();

    if (quizError || !quiz) {
      throw new AppError("Quiz not found or access denied", 404);
    }

    // Build quiz context
    quizContext = {
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      originalPrompt: quiz.original_prompt || quiz.title,
    };
  } else {
    // Use provided context for prototype mode
    if (!context) {
      throw new AppError("Context is required for prototype mode", 400);
    }
    quizContext = context;
  }

  // Enhance question using AI
  const result = await enhanceQuestion(questionText, quizContext);

  console.log(
    `[Quiz Service] Successfully enhanced question for ${quizId || "prototype"}`
  );

  return result;
}

export async function generateOptionsForQuestion(
  quizId: string | null,
  userId: string,
  questionText: string,
  existingOptions: Array<{ option_text: string; is_correct: boolean }>,
  optionsCount: number
): Promise<GeneratedOptionsResult> {
  console.log(
    `[Quiz Service] Generating ${optionsCount} options for question in ${quizId ? `quiz ${quizId}` : "prototype"} by user ${userId}`
  );

  if (quizId) {
    // Verify user owns the quiz
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("id")
      .eq("id", quizId)
      .eq("user_id", userId)
      .single();

    if (quizError || !quiz) {
      throw new AppError("Quiz not found or access denied", 404);
    }
  }

  // Generate options using AI
  const result = await generateAdditionalOptions(
    questionText,
    existingOptions,
    optionsCount
  );

  console.log(
    `[Quiz Service] Successfully generated ${result.options.length} options for question in ${quizId || "prototype"}`
  );

  return result;
}

export async function getQuestionTypeSuggestions(
  quizId: string | null,
  userId: string,
  topic: string,
  difficulty: "easy" | "medium" | "hard"
): Promise<QuestionTypeSuggestionsResult> {
  console.log(
    `[Quiz Service] Getting question type suggestions for ${quizId ? `quiz ${quizId}` : "prototype"} by user ${userId}`
  );

  if (quizId) {
    // Verify user owns the quiz
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("id")
      .eq("id", quizId)
      .eq("user_id", userId)
      .single();

    if (quizError || !quiz) {
      throw new AppError("Quiz not found or access denied", 404);
    }
  }

  // Get question type suggestions using AI
  const result = await suggestQuestionTypes(topic, difficulty);

  console.log(
    `[Quiz Service] Successfully generated ${result.suggestions.length} question type suggestions for ${quizId || "prototype"}`
  );

  return result;
}
