import { axiosInstance } from "./axios";
import type { QuizFormData } from "./validation";

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
  };
  message: string;
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

/**
 * Generate a quiz using AI
 */
export async function generateQuiz(formData: QuizFormData): Promise<Quiz> {
  const response = await axiosInstance.post<CreateQuizResponse>(
    "/quizzes/generate",
    {
      prompt: formData.prompt,
      difficulty: formData.difficulty,
      optionsCount: formData.optionsCount,
      questionCount: formData.questionCount,
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to generate quiz");
  }

  return response.data.data.quiz;
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
  offset: number = 0
): Promise<Quiz[]> {
  const response = await axiosInstance.get<GetQuizzesResponse>(
    `/quizzes/public?limit=${limit}&offset=${offset}`
  );

  if (!response.data.success) {
    throw new Error("Failed to fetch public quizzes");
  }

  return response.data.data.quizzes;
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
  >
): Promise<Quiz> {
  const response = await axiosInstance.put<CreateQuizResponse>(
    `/quizzes/${id}`,
    updates
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
