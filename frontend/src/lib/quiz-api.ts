import { axiosInstance } from "./axios";

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
  questions?: Question[];

  // Stats
  attempts?: number;
  average_score?: number;
}

export interface QuizWithCreator extends Quiz {
  creator: {
    name: string;
    avatar_url?: string;
  };
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "short_answer";
  order_index: number;
  created_at: string;
  updated_at: string;
  question_options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
}

export interface CreateQuizResponse {
  success: boolean;
  data: {
    quiz: Quiz;
    mode: "express" | "advanced";
    is_manual_mode?: boolean;
  };
  message: string;
}

export interface CreateQuizExpressInput {
  prompt: string;
  is_public: boolean;
}

export interface CreateQuizAdvancedInput {
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  optionsCount: number;
  isManualMode: boolean;
  is_public: boolean;
}

export interface GetQuizzesResponse {
  success: boolean;
  data: {
    quizzes: Quiz[];
  };
}

export interface GetQuizResponse {
  success: boolean;
  data: {
    quiz: Quiz;
  };
}

export interface SurpriseMeResponse {
  success: boolean;
  data: {
    prompt: string;
  };
  message: string;
}

export interface SubmitQuizInput {
  answers: Array<{
    questionId: string;
    optionId: string;
  }>;
}

export interface SubmitQuizQuestionResult {
  questionId: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
}

export interface SubmitQuizResult {
  attemptId: string;
  score: number;
  percentage: number;
  results: SubmitQuizQuestionResult[];
  completedAt: string;
}

/**
 * Create a quiz using Express Mode (defaults: 5 questions, 4 options, medium difficulty)
 */
export async function createQuizExpress(
  input: CreateQuizExpressInput,
): Promise<{
  quiz: Quiz;
}> {
  const response = await axiosInstance.post<CreateQuizResponse>(
    "/quizzes/create/express",
    input,
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to create quiz");
  }

  return {
    quiz: response.data.data.quiz,
  };
}

/**
 * Create a quiz using Advanced Mode (custom settings)
 */
export async function createQuizAdvanced(
  input: CreateQuizAdvancedInput,
): Promise<{
  quiz: Quiz;
  isManualMode: boolean;
}> {
  const response = await axiosInstance.post<CreateQuizResponse>(
    "/quizzes/create/advanced",
    input,
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to create quiz");
  }

  return {
    quiz: response.data.data.quiz,
    isManualMode: response.data.data.is_manual_mode || false,
  };
}

/**
 * Get user's quizzes
 */
export async function getUserQuizzes(): Promise<Quiz[]> {
  const response = await axiosInstance.get<GetQuizzesResponse>("/quizzes/my");

  if (!response.data.success) {
    throw new Error("Failed to fetch quizzes");
  }

  return response.data.data.quizzes;
}

/**
 * Get public quizzes
 */
export async function getPublicQuizzes(
  limit: number = 50,
  offset: number = 0,
): Promise<Quiz[]> {
  const response = await axiosInstance.get<GetQuizzesResponse>(
    `/quizzes/public?limit=${limit}&offset=${offset}`,
  );

  if (!response.data.success) {
    throw new Error("Failed to fetch public quizzes");
  }

  return response.data.data.quizzes;
}

/**
 * Get a specific quiz by ID for preview (includes answers and creator info)
 */
export async function getQuizByIdForPreview(
  id: string,
): Promise<QuizWithCreator> {
  const response = await axiosInstance.get<{
    success: boolean;
    data: {
      quiz: QuizWithCreator;
    };
  }>(`/quizzes/${id}/preview`);

  if (!response.data.success) {
    throw new Error("Failed to fetch quiz for preview");
  }

  return response.data.data.quiz;
}

/**
 * Get a specific quiz by ID
 */
export async function getQuizById(id: string): Promise<Quiz> {
  const response = await axiosInstance.get<GetQuizResponse>(`/quizzes/${id}`);

  if (!response.data.success) {
    throw new Error("Failed to fetch quiz");
  }

  return response.data.data.quiz;
}

/**
 * Update a quiz
 */
export async function updateQuiz(
  id: string,
  updates: Partial<
    Pick<Quiz, "title" | "description" | "difficulty" | "is_public">
  >,
): Promise<Quiz> {
  const response = await axiosInstance.put<CreateQuizResponse>(
    `/quizzes/${id}`,
    updates,
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to update quiz");
  }

  return response.data.data.quiz;
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(id: string): Promise<void> {
  const response = await axiosInstance.delete(`/quizzes/${id}`);

  if (!response.data.success) {
    throw new Error("Failed to delete quiz");
  }
}

/**
 * Generate a creative quiz prompt using AI
 */
export async function surpriseMe(): Promise<string> {
  const response = await axiosInstance.post<SurpriseMeResponse>(
    "/quizzes/surprise-me",
  );

  if (!response.data.success) {
    throw new Error(
      response.data.message || "Failed to generate surprise prompt",
    );
  }

  return response.data.data.prompt;
}

export async function submitQuiz(
  quizId: string,
  input: SubmitQuizInput,
): Promise<SubmitQuizResult> {
  const response = await axiosInstance.post<{
    success: boolean;
    data: SubmitQuizResult;
    message?: string;
  }>(`/quizzes/${quizId}/submit`, input);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to submit quiz");
  }
  return response.data.data;
}
