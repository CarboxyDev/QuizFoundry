import supabase from "../lib/supabase";
import { AppError } from "../errors/AppError";
import {
  generateQuizWithAI,
  type GeneratedQuiz,
  generateCreativeQuizPrompt,
  validateQuizContent,
  type QuizContentForValidation,
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
      `[Quiz Service] Creating Advanced Mode quiz for user ${userId} (Manual: ${input.isManualMode})`
    );

    // Generate quiz with AI using custom settings
    const generatedQuiz = await generateQuizWithAI({
      prompt: input.prompt,
      questionCount: input.questionCount,
      optionsCount: input.optionsCount,
      difficulty: input.difficulty,
    });

    // If manual mode is enabled, return the prototype without saving to DB
    if (input.isManualMode) {
      console.log(
        `[Quiz Service] Manual mode enabled - returning prototype quiz: "${generatedQuiz.title}"`
      );

      // Convert GeneratedQuiz to QuizWithQuestions format for consistent response
      const prototypeQuiz: QuizWithQuestions = {
        // Temporary fields for prototype (no real DB values)
        id: "prototype",
        user_id: userId,
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        difficulty: generatedQuiz.difficulty,
        is_public: input.is_public,
        is_ai_generated: true, // Initially AI generated
        is_manual: true, // Will be manual after editing
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
    }

    // Regular advanced mode - save to database
    const quiz = await saveGeneratedQuiz(
      userId,
      input.prompt,
      generatedQuiz,
      false,
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
     * But bypass if the BYPASS_CHECKS environment variable is set to tru (for local testing)
     */
    if (env.BYPASS_CHECKS !== "true") {
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

  // Add question count and attempts
  const quizzesWithStats = quizzesData.map((quiz: any) => {
    const questionCount = countMap.get(quiz.id) || 0;
    const attempts = attemptsMap.get(quiz.id) || 0;
    return {
      ...quiz,
      attempts,
      question_count: questionCount,
    };
  });

  console.log(`[Quiz Service] Found ${quizzesWithStats.length} public quizzes`);
  return quizzesWithStats;
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

    // Apply AI security validation (same as manual quiz publishing)
    if (env.BYPASS_CHECKS !== "true") {
      console.log(
        `[Quiz Service] Validating quiz content with AI security check`
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
        `[Quiz Service] Quiz update approved by AI security check (confidence: ${securityResult.confidence}%)`
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
  return quizzes.map((quiz) => {
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
