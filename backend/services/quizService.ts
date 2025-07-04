import supabase from "../lib/supabase";
import { AppError } from "../errors/AppError";
import { generateQuizWithAI, type GeneratedQuiz } from "../lib/gemini";
import type {
  CreateQuizInput,
  CreateManualQuizInput,
  UpdateQuizInput,
  CreateQuestionInput,
  UpdateQuestionInput,
} from "../schemas/quizSchemas";

export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
  is_public: boolean;
  is_ai_generated: boolean;
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

/**
 * Generate a quiz using AI and save it to the database
 */
export async function createQuizWithAI(
  userId: string,
  input: CreateQuizInput
): Promise<QuizWithQuestions> {
  try {
    // Instruct Gemini to derive keywords and generate a concise title
    const geminiPrompt = `Derive the main keywords from the following prompt and generate a quiz. The quiz title must be concise (max 8 words). Prompt: ${input.prompt}`;
    const generatedQuiz = await generateQuizWithAI({
      ...input,
      prompt: geminiPrompt,
    });
    // Optionally, trim the title if too long
    if (generatedQuiz.title.split(" ").length > 8) {
      generatedQuiz.title = generatedQuiz.title
        .split(" ")
        .slice(0, 8)
        .join(" ");
    }
    // Save to database
    const quiz = await saveGeneratedQuiz(userId, input, generatedQuiz);
    return quiz;
  } catch (error) {
    console.error("Error creating quiz with AI:", error);
    throw error;
  }
}

/**
 * Save AI-generated quiz to database
 */
async function saveGeneratedQuiz(
  userId: string,
  originalInput: CreateQuizInput,
  generatedQuiz: GeneratedQuiz
): Promise<QuizWithQuestions> {
  try {
    // Start a transaction by creating the quiz first
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        user_id: userId,
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        difficulty: generatedQuiz.difficulty,
        is_public: true, // Make quizzes public by default
        is_ai_generated: true,
        original_prompt: originalInput.prompt,
      })
      .select()
      .single();

    if (quizError || !quizData) {
      throw new AppError(`Failed to create quiz: ${quizError?.message}`, 500);
    }

    // Save questions
    const questions: Question[] = [];

    for (const generatedQuestion of generatedQuiz.questions) {
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
          `Failed to create question: ${questionError?.message}`,
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
          `Failed to create question options: ${optionsError.message}`,
          500
        );
      }

      questions.push({
        ...questionData,
        options: optionsData || [],
      });
    }

    return {
      ...quizData,
      questions,
    };
  } catch (error) {
    console.error("Error saving generated quiz:", error);
    throw error;
  }
}

/**
 * Create a manual quiz (without AI)
 */
export async function createManualQuiz(
  userId: string,
  input: CreateManualQuizInput
): Promise<Quiz> {
  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description,
      difficulty: input.difficulty,
      is_public: input.is_public ?? true, // Default to public if not specified
      is_ai_generated: false,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(`Failed to create quiz: ${error.message}`, 500);
  }

  return data;
}

/**
 * Get a quiz by ID with questions
 */
export async function getQuizById(
  quizId: string,
  userId?: string
): Promise<QuizWithQuestions | null> {
  // First get the quiz
  const { data: quizData, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (quizError) {
    if (quizError.code === "PGRST116") {
      return null;
    }
    throw new AppError(`Failed to fetch quiz: ${quizError.message}`, 500);
  }

  // Check if user has access to this quiz
  if (!quizData.is_public && (!userId || quizData.user_id !== userId)) {
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

  return {
    ...quizData,
    questions: questionsData || [],
  };
}

/**
 * Get user's quizzes
 */
export async function getUserQuizzes(userId: string): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(`Failed to fetch user quizzes: ${error.message}`, 500);
  }

  return data || [];
}

/**
 * Get public quizzes
 */
export async function getPublicQuizzes(
  limit: number = 50,
  offset: number = 0
): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(`Failed to fetch public quizzes: ${error.message}`, 500);
  }

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

  return data;
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(
  quizId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId)
    .eq("user_id", userId);

  if (error) {
    throw new AppError(`Failed to delete quiz: ${error.message}`, 500);
  }
}

/**
 * Add a question to a quiz
 */
export async function createQuestion(
  userId: string,
  input: CreateQuestionInput
): Promise<Question> {
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

    return {
      ...questionData,
      options: optionsData || [],
    };
  }

  return {
    ...questionData,
    options: [],
  };
}
