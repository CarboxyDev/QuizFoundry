import express from "express";
import asyncHandler from "express-async-handler";
import { getQuizAnalyticsSchema } from "../schemas/quizSchemas";
import { AppError } from "../errors/AppError";
import { getQuizAnalytics } from "../services/quizService";
import {
  authMiddleware,
  requireCompletedOnboarding,
  AuthenticatedRequest,
} from "../middleware/auth";
import { generalApiLimiter } from "../lib/ratelimits";
import type { Router } from "express";

const analyticsRouter: Router = express.Router();

/**
 * GET /analytics/quiz/:quizId - Get comprehensive analytics for a specific quiz
 * Owner-only access with detailed metrics including:
 * - Overview stats (attempts, users, scores, completion rate)
 * - Performance metrics (score distribution, difficulty analysis)
 * - Engagement data (attempts over time, top performers, recent activity)
 * - Question-level analysis (correct rates, option selection patterns)
 */
analyticsRouter.get(
  "/quiz/:quizId",
  generalApiLimiter,
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    const { quizId } = req.params;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    // Validate quiz ID format
    const validationResult = getQuizAnalyticsSchema.safeParse({ quizId });
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }

    try {
      const analytics = await getQuizAnalytics(quizId, userId);

      res.json({
        success: true,
        data: {
          analytics,
        },
        message: "Quiz analytics retrieved successfully",
      });
    } catch (error) {
      console.error(
        `[Analytics] Error fetching analytics for quiz ${quizId}:`,
        error
      );
      throw error;
    }
  })
);

export default analyticsRouter;
