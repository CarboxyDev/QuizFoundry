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
  question_count?: number;
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

// Manual quiz creation interfaces
export interface CreatePrototypeQuizInput {
  prompt: string;
  questionCount: number;
  optionsCount: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface CreatePrototypeQuizResponse {
  success: boolean;
  data: {
    prototype: {
      title: string;
      description?: string;
      difficulty: "easy" | "medium" | "hard";
      questions: Array<{
        question_text: string;
        question_type: "multiple_choice" | "short_answer";
        order_index: number;
        options: Array<{
          option_text: string;
          is_correct: boolean;
          order_index: number;
        }>;
      }>;
    };
    original_prompt: string;
  };
  message: string;
}

export interface PublishManualQuizInput {
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
  is_public: boolean;
  original_prompt?: string;
  questions: Array<{
    question_text: string;
    question_type: "multiple_choice" | "short_answer";
    order_index: number;
    options: Array<{
      option_text: string;
      is_correct: boolean;
      order_index: number;
    }>;
  }>;
}

export interface PublishManualQuizResponse {
  success: boolean;
  data: {
    quiz: Quiz;
  };
  message: string;
}

export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

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
    scoreDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    difficultyRating: {
      perceived: string;
      actualDifficulty: number;
    };
  };
  engagement: {
    attemptsOverTime: Array<{
      date: string;
      count: number;
    }>;
    topPerformers: Array<{
      userId: string;
      userName: string;
      userAvatarUrl: string;
      score: number;
      percentage: number;
      completedAt: string;
    }>;
    recentActivity: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
    };
  };
  questions: Array<{
    questionId: string;
    questionText: string;
    orderIndex: number;
    correctRate: number;
    totalAnswers: number;
    difficulty: string;
    optionAnalysis: Array<{
      optionId: string;
      optionText: string;
      isCorrect: boolean;
      selectedCount: number;
      percentage: number;
    }>;
  }>;
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
 * Get public quiz statistics
 */
export async function getPublicQuizStats(): Promise<PublicQuizStats> {
  const response = await axiosInstance.get<{
    success: boolean;
    data: { stats: PublicQuizStats };
  }>("/quizzes/public/stats");

  if (!response.data.success) {
    throw new Error("Failed to fetch public quiz stats");
  }

  return response.data.data.stats;
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
 * Update a quiz with complete questions and options
 */
export async function updateQuizWithQuestions(
  id: string,
  input: {
    title: string;
    description?: string;
    difficulty: "easy" | "medium" | "hard";
    is_public: boolean;
    questions: Array<{
      question_text: string;
      question_type: "multiple_choice" | "short_answer";
      order_index: number;
      options: Array<{
        option_text: string;
        is_correct: boolean;
        order_index: number;
      }>;
    }>;
  },
): Promise<QuizWithQuestions> {
  try {
    const response = await axiosInstance.put<{
      success: boolean;
      data: {
        quiz: QuizWithQuestions;
      };
      message: string;
    }>(`/quizzes/${id}`, input);

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update quiz");
    }

    return response.data.data.quiz;
  } catch (error) {
    // Re-throw the error to preserve detailed information from the backend
    throw error;
  }
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

/**
 * Create a prototype quiz for manual editing (AI generated but not saved to DB)
 */
export async function createPrototypeQuiz(
  input: CreatePrototypeQuizInput,
): Promise<{
  prototype: CreatePrototypeQuizResponse["data"]["prototype"];
  originalPrompt: string;
}> {
  const response = await axiosInstance.post<CreatePrototypeQuizResponse>(
    "/manual-quizzes/create-prototype",
    input,
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to create prototype quiz");
  }

  return {
    prototype: response.data.data.prototype,
    originalPrompt: response.data.data.original_prompt,
  };
}

/**
 * Publish a manually edited quiz after AI security validation
 */
export async function publishManualQuiz(
  input: PublishManualQuizInput,
): Promise<Quiz> {
  try {
    const response = await axiosInstance.post<PublishManualQuizResponse>(
      "/manual-quizzes/publish",
      input,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to publish quiz");
    }

    return response.data.data.quiz;
  } catch (error) {
    // Re-throw the error to preserve the detailed message from the backend
    throw error;
  }
}

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
    topPerformingQuizzes: Array<{
      quizId: string;
      title: string;
      avgScore: number;
      attempts: number;
      uniqueUsers: number;
      difficulty: string;
      createdAt: string;
    }>;
    scoreDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
  };
  engagement: {
    creationTrend: Array<{
      date: string;
      count: number;
    }>;
    attemptsTrend: Array<{
      date: string;
      count: number;
    }>;
    recentActivity: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
    };
  };
  topQuizzes: {
    mostPopular: Array<{
      quizId: string;
      title: string;
      attempts: number;
      uniqueUsers: number;
      avgScore: number;
    }>;
    highestRated: Array<{
      quizId: string;
      title: string;
      avgScore: number;
      attempts: number;
      difficulty: string;
    }>;
  };
}

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
    scoreDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    progressTrend: Array<{
      date: string;
      avgScore: number;
      attempts: number;
    }>;
    strengthsByDifficulty: {
      easy: { attempts: number; avgScore: number; improvement: number };
      medium: { attempts: number; avgScore: number; improvement: number };
      hard: { attempts: number; avgScore: number; improvement: number };
    };
  };
  engagement: {
    activityTrend: Array<{
      date: string;
      attempts: number;
    }>;
    streaks: {
      currentStreak: number;
      longestStreak: number;
      lastActive: string;
    };
    favoriteTopics: Array<{
      topic: string;
      attempts: number;
      avgScore: number;
    }>;
  };
  achievements: {
    perfectScores: number;
    improvementRate: number;
    consistencyScore: number;
    challenges: Array<{
      name: string;
      description: string;
      completed: boolean;
      progress: number;
    }>;
  };
  recentAttempts: Array<{
    quizId: string;
    quizTitle: string;
    score: number;
    percentage: number;
    difficulty: string;
    completedAt: string;
    creatorName: string | null;
  }>;
}

export const getQuizAnalytics = async (
  quizId: string,
): Promise<QuizAnalytics> => {
  const response = await axiosInstance.get(`/analytics/quiz/${quizId}`);
  return response.data.data.analytics;
};

export const getCreatorAnalytics = async (): Promise<CreatorAnalytics> => {
  const response = await axiosInstance.get("/analytics/creator");
  return response.data.data.analytics;
};

export const getParticipantAnalytics =
  async (): Promise<ParticipantAnalytics> => {
    const response = await axiosInstance.get("/analytics/participant");
    return response.data.data.analytics;
  };

export interface OverviewAnalytics {
  quizzesCreated: number;
  quizzesAttempted: number;
  averageScore: number;
  totalParticipants: number;
}

export const getOverviewAnalytics = async (): Promise<OverviewAnalytics> => {
  const response = await axiosInstance.get("/analytics/overview");
  return response.data.data.analytics;
};
