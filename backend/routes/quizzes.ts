import express from "express";
import asyncHandler from "express-async-handler";
import {
  createQuizExpressModeSchema,
  createQuizAdvancedModeSchema,
  updateQuizSchema,
  createQuestionSchema,
} from "../schemas/quizSchemas";
import { AppError } from "../errors/AppError";
import {
  createQuizExpressMode,
  createQuizAdvancedMode,
  createManualQuiz,
  getQuizById,
  getQuizByIdForPreview,
  getUserQuizzesWithStats,
  getPublicQuizzes,
  updateQuiz,
  deleteQuiz,
  createQuestion,
  getCreativeQuizPrompt,
  submitQuizAttempt,
  getQuizAttempts,
} from "../services/quizService";
import {
  authMiddleware,
  requireCompletedOnboarding,
  AuthenticatedRequest,
} from "../middleware/auth";
import {
  aiOperationsLimiter,
  creativePromptsLimiter,
  generalApiLimiter,
} from "../lib/ratelimits";
import type { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { SubmitQuizRequest } from "../types/api";

const quizzesRouter: Router = express.Router();

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

function stripAnswersFromQuestion(question: any) {
  // Handle both possible field names for options
  const optionsField = question.question_options || question.options;
  if (!optionsField) return question;

  const sanitizedOptions: OptionWithoutAnswer[] = optionsField.map(
    ({ is_correct, ...rest }: any) => rest
  );

  // Return with the same field name structure as input
  if (question.question_options) {
    return {
      ...question,
      question_options: sanitizedOptions,
    };
  } else {
    return {
      ...question,
      options: sanitizedOptions,
    };
  }
}

function stripAnswersFromQuiz(quiz: any) {
  if (!quiz.questions) return quiz;
  const sanitizedQuestions = quiz.questions.map(stripAnswersFromQuestion);
  return {
    ...quiz,
    questions: sanitizedQuestions,
  };
}

// =============================================
// CREATE QUIZ ENDPOINTS
// =============================================

/**
 * POST /quizzes/create/express - Create quiz using Express Mode
 * Uses defaults: 5 questions, 4 options, medium difficulty
 */
quizzesRouter.post(
  "/create/express",
  aiOperationsLimiter,
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const validationResult = createQuizExpressModeSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }

    const quiz = await createQuizExpressMode(userId, validationResult.data);

    // Strip answers from response
    const sanitizedQuiz = stripAnswersFromQuiz(quiz);

    res.status(201).json({
      success: true,
      data: {
        quiz: sanitizedQuiz,
        mode: "express",
      },
      message: "Quiz created successfully in Express Mode",
    });
  })
);

/**
 * POST /quizzes/create/advanced - Create quiz using Advanced Mode
 * Uses custom settings with optional Manual Mode
 * Behavior depends on isManualMode flag
 */
quizzesRouter.post(
  "/create/advanced",
  aiOperationsLimiter,
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const validationResult = createQuizAdvancedModeSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }

    const quiz = await createQuizAdvancedMode(userId, validationResult.data);

    const sanitizedQuiz = stripAnswersFromQuiz(quiz);

    const isManualMode = validationResult.data.isManualMode;

    res.status(201).json({
      success: true,
      data: {
        quiz: sanitizedQuiz,
        mode: "advanced",
        is_manual_mode: isManualMode,
      },
      message: `Quiz created successfully in Advanced Mode${isManualMode ? " (Manual editing enabled)" : ""}`,
    });
  })
);

/**
 * GET /quizzes/my - Get current user's quizzes
 */
quizzesRouter.get(
  "/my",
  generalApiLimiter,
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const quizzes = await getUserQuizzesWithStats(userId);

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
 * GET /quizzes/:id/attempts - Get all attempts for a quiz (owner only)
 */
quizzesRouter.get(
  "/:id/attempts",
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

    const attempts = await getQuizAttempts(id, userId);

    res.json({
      success: true,
      data: {
        attempts,
      },
    });
  })
);

/**
 * GET /quizzes/:id/preview - Get a specific quiz by ID for preview (with answers)
 */
quizzesRouter.get(
  "/:id/preview",
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

    const quiz = await getQuizByIdForPreview(id, userId);

    if (!quiz) {
      throw new AppError("Quiz not found", 404);
    }

    res.json({
      success: true,
      data: {
        quiz,
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

/**
 * POST /quizzes/surprise-me - Generate a creative quiz prompt using AI
 */
quizzesRouter.post(
  "/surprise-me",
  creativePromptsLimiter,
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    try {
      const prompt = await getCreativeQuizPrompt();
      res.json({
        success: true,
        data: { prompt },
        message: "Creative quiz prompt generated successfully",
      });
    } catch (error) {
      console.error("[Surprise Me] Error generating prompt:", error);
      throw new AppError(
        "Failed to generate creative quiz prompt. Please try again.",
        500
      );
    }
  })
);

/**
 * POST /quizzes/:id/submit - Submit answers for a quiz and get result
 */
quizzesRouter.post(
  "/:id/submit",
  generalApiLimiter,
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);
    if (!id || typeof id !== "string")
      throw new AppError("Quiz ID is required", 400);

    // Validate request body
    const schema = z.object({
      answers: z.array(
        z.object({
          questionId: z.string(),
          optionId: z.string(),
        })
      ),
    });
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }
    const submitReq: SubmitQuizRequest = parseResult.data;

    const result = await submitQuizAttempt(userId, id, submitReq);
    res.json({
      success: true,
      data: result,
    });
  })
);

export default quizzesRouter;
