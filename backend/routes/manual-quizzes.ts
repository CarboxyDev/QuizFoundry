import express from "express";
import asyncHandler from "express-async-handler";
import {
  createPrototypeQuizSchema,
  publishManualQuizSchema,
} from "../schemas/quizSchemas";
import { AppError } from "../errors/AppError";
import {
  createPrototypeQuiz,
  publishManualQuiz,
} from "../services/quizService";
import {
  authMiddleware,
  requireCompletedOnboarding,
  AuthenticatedRequest,
} from "../middleware/auth";
import { aiOperationsLimiter, securityValidationLimiter } from "../lib/ratelimits";
import type { Router } from "express";

const manualQuizzesRouter: Router = express.Router();

/**
 * POST /manual-quizzes/create-prototype - Create a prototype quiz for manual editing
 * Uses AI to generate initial content but doesn't save to database
 */
manualQuizzesRouter.post(
  "/create-prototype",
  aiOperationsLimiter,
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const validationResult = createPrototypeQuizSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }

    const prototypeQuiz = await createPrototypeQuiz(validationResult.data);

    res.status(201).json({
      success: true,
      data: {
        prototype: prototypeQuiz,
        original_prompt: validationResult.data.prompt,
      },
      message: "Prototype quiz created successfully for manual editing",
    });
  })
);

/**
 * POST /manual-quizzes/publish - Publish a manually edited quiz
 * Validates content with AI security checks and saves to database
 */
manualQuizzesRouter.post(
  "/publish",
  securityValidationLimiter,
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const validationResult = publishManualQuizSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }

    const publishedQuiz = await publishManualQuiz(
      userId,
      validationResult.data
    );

    res.status(201).json({
      success: true,
      data: {
        quiz: publishedQuiz,
      },
      message: "Manual quiz published successfully",
    });
  })
);

export default manualQuizzesRouter;
