import express from "express";
import asyncHandler from "express-async-handler";
import {
  createQuizExpressModeSchema,
  createQuizAdvancedModeSchema,
  updateQuizSchema,
  updateQuizWithQuestionsSchema,
  createQuestionSchema,
} from "../schemas/quizSchemas";
import { AppError } from "../errors/AppError";
import {
  createQuizExpressMode,
  createQuizAdvancedMode,
  getQuizById,
  getQuizByIdForPreview,
  getUserQuizzesWithStats,
  getPublicQuizzes,
  getPublicQuizStats,
  updateQuiz,
  updateQuizWithQuestions,
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
  const optionsField = question.question_options || question.options;
  if (!optionsField) return question;

  const sanitizedOptions: OptionWithoutAnswer[] = optionsField.map(
    ({ is_correct, ...rest }: any) => rest
  );

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

/**
 * POST /quizzes/create/express - Create quiz using Express Mode
 * Uses custom settings and creates final quiz immediately
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

    // Express mode creates final quiz immediately with custom settings
    const quiz = await createQuizExpressMode(userId, {
      ...validationResult.data,
    });

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
 * Always creates a prototype quiz for manual editing before publishing
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

    // Advanced mode always creates prototype quiz for manual editing
    const quiz = await createQuizAdvancedMode(userId, {
      ...validationResult.data,
    });

    // Return the prototype with answers intact for editing
    res.status(201).json({
      success: true,
      data: {
        quiz,
        mode: "advanced",
        is_manual_mode: true,
        is_prototype: true,
        original_prompt: validationResult.data.prompt,
      },
      message:
        "Prototype quiz created successfully in Advanced Mode (Manual editing enabled)",
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

    // Validate pagination params
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
 * GET /quizzes/public/stats - Get public quiz statistics
 */
quizzesRouter.get(
  "/public/stats",
  asyncHandler(async (req, res) => {
    const stats = await getPublicQuizStats();

    res.json({
      success: true,
      data: {
        stats,
      },
    });
  })
);

/**
 * GET /quizzes/:id/attempts - Get all attempts for a quiz (OWNER ONLY)
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
 * GET /quizzes/:id/preview - Get a specific quiz by ID for preview (with answers) (OWNER ONLY)
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
 * Supports both metadata-only updates and full updates with questions (OWNER ONLY)
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

    // Check if the request includes questions (full update) or just metadata
    const includesQuestions =
      req.body.questions && Array.isArray(req.body.questions);

    if (includesQuestions) {
      // Full quiz update with questions
      const validationResult = updateQuizWithQuestionsSchema.safeParse(
        req.body
      );

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => err.message);
        throw new AppError(errors.join("; "), 400);
      }

      const quiz = await updateQuizWithQuestions(
        id,
        userId,
        validationResult.data
      );

      res.json({
        success: true,
        data: {
          quiz,
        },
        message: "Quiz updated successfully with questions",
      });
    } else {
      // Regular metadata-only update
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
    }
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
