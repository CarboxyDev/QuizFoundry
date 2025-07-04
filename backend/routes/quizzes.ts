import express from "express";
import asyncHandler from "express-async-handler";
import {
  createQuizSchema,
  updateQuizSchema,
  createQuestionSchema,
} from "../schemas/quizSchemas";
import { AppError } from "../errors/AppError";
import {
  createQuizWithAI,
  createManualQuiz,
  getQuizById,
  getUserQuizzes,
  getPublicQuizzes,
  updateQuiz,
  deleteQuiz,
  createQuestion,
} from "../services/quizService";
import {
  authMiddleware,
  requireCompletedOnboarding,
  AuthenticatedRequest,
} from "../middleware/auth";
import type { Router } from "express";

const quizzesRouter: Router = express.Router();

// Helper utilities to prevent exposing correct answers to the client

type OptionWithoutAnswer = Omit<
  {
    id: string;
    question_id: string;
    option_text: string;
    order_index: number;
    created_at?: string;
  },
  "is_correct"
>;

function stripAnswersFromQuestion<QuestionType extends { options?: any[] }>(
  question: QuestionType
) {
  if (!question.options) return question;
  const sanitizedOptions: OptionWithoutAnswer[] = question.options.map(
    ({ is_correct, ...rest }) => rest
  );
  return {
    ...question,
    options: sanitizedOptions,
  };
}

function stripAnswersFromQuiz<QuizType extends { questions: any[] }>(
  quiz: QuizType
) {
  const sanitizedQuestions = quiz.questions.map(stripAnswersFromQuestion);
  return {
    ...quiz,
    questions: sanitizedQuestions,
  };
}

/**
 * POST /quizzes/generate - Generate a quiz using AI
 * Requires authentication and completed onboarding
 */
quizzesRouter.post(
  "/generate",
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const validationResult = createQuizSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }

    const quiz = await createQuizWithAI(userId, validationResult.data);

    // Do not expose correct answers to the client
    const sanitizedQuiz = stripAnswersFromQuiz(quiz);

    res.status(201).json({
      success: true,
      data: {
        quiz: sanitizedQuiz,
      },
      message: "Quiz generated successfully",
    });
  })
);

/**
 * GET /quizzes/my - Get current user's quizzes
 */
quizzesRouter.get(
  "/my",
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const quizzes = await getUserQuizzes(userId);

    res.json({
      success: true,
      data: {
        quizzes,
      },
    });
  })
);

/**
 * GET /quizzes/public - Get public quizzes
 */
quizzesRouter.get(
  "/public",
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Validate pagination parameters
    if (limit > 100) {
      throw new AppError("Limit cannot exceed 100", 400);
    }
    if (limit < 1) {
      throw new AppError("Limit must be at least 1", 400);
    }
    if (offset < 0) {
      throw new AppError("Offset must be non-negative", 400);
    }

    const quizzes = await getPublicQuizzes(limit, offset);

    res.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          limit,
          offset,
          count: quizzes.length,
        },
      },
    });
  })
);

/**
 * GET /quizzes/:id - Get a specific quiz by ID
 */
quizzesRouter.get(
  "/:id",
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    if (!id || typeof id !== "string") {
      throw new AppError("Quiz ID is required", 400);
    }

    const quiz = await getQuizById(id, userId);

    if (!quiz) {
      throw new AppError("Quiz not found", 404);
    }

    const sanitizedQuiz = stripAnswersFromQuiz(quiz);

    res.json({
      success: true,
      data: {
        quiz: sanitizedQuiz,
      },
    });
  })
);

/**
 * PUT /quizzes/:id - Update a quiz
 */
quizzesRouter.put(
  "/:id",
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    if (!id || typeof id !== "string") {
      throw new AppError("Quiz ID is required", 400);
    }

    const validationResult = updateQuizSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }

    const quiz = await updateQuiz(id, userId, validationResult.data);

    res.json({
      success: true,
      data: {
        quiz,
      },
      message: "Quiz updated successfully",
    });
  })
);

/**
 * DELETE /quizzes/:id - Delete a quiz
 */
quizzesRouter.delete(
  "/:id",
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    if (!id || typeof id !== "string") {
      throw new AppError("Quiz ID is required", 400);
    }

    await deleteQuiz(id, userId);

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  })
);

/**
 * POST /quizzes/:id/questions - Add a question to a quiz
 */
quizzesRouter.post(
  "/:id/questions",
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    if (!id || typeof id !== "string") {
      throw new AppError("Quiz ID is required", 400);
    }

    const validationResult = createQuestionSchema.safeParse({
      ...req.body,
      quiz_id: id,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }

    const question = await createQuestion(userId, validationResult.data);

    const sanitizedQuestion = stripAnswersFromQuestion(question);

    res.status(201).json({
      success: true,
      data: {
        question: sanitizedQuestion,
      },
      message: "Question added successfully",
    });
  })
);

export default quizzesRouter;
