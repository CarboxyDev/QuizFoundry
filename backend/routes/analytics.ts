import express from "express";
import asyncHandler from "express-async-handler";
import {
  getQuizAnalyticsSchema,
  getCreatorAnalyticsSchema,
  getParticipantAnalyticsSchema,
  getOverviewAnalyticsSchema,
} from "../schemas/quizSchemas";
import { AppError } from "../errors/AppError";
import {
  getQuizAnalytics,
  getCreatorAnalytics,
  getParticipantAnalytics,
  getOverviewAnalytics,
} from "../services/quizService";
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

/**
 * GET /analytics/creator - Get comprehensive analytics for all quizzes created by the user
 * Includes overview stats, performance breakdowns, engagement metrics, and top-performing quizzes
 */
analyticsRouter.get(
  "/creator",
  generalApiLimiter,
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    // Validate input (empty object for now)
    const validationResult = getCreatorAnalyticsSchema.safeParse({});
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }

    try {
      const analytics = await getCreatorAnalytics(userId);

      res.json({
        success: true,
        data: {
          analytics,
        },
        message: "Creator analytics retrieved successfully",
      });
    } catch (error) {
      console.error(
        `[Analytics] Error fetching creator analytics for user ${userId}:`,
        error
      );
      throw error;
    }
  })
);

/**
 * GET /analytics/participant - Get comprehensive analytics for all quizzes attempted by the user
 * Includes performance metrics, progress tracking, achievements, and engagement data
 */
analyticsRouter.get(
  "/participant",
  generalApiLimiter,
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    // Validate input (empty object for now)
    const validationResult = getParticipantAnalyticsSchema.safeParse({});
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }

    try {
      const analytics = await getParticipantAnalytics(userId);

      res.json({
        success: true,
        data: {
          analytics,
        },
        message: "Participant analytics retrieved successfully",
      });
    } catch (error) {
      console.error(
        `[Analytics] Error fetching participant analytics for user ${userId}:`,
        error
      );
      throw error;
    }
  })
);

/**
 * GET /analytics/overview - Get overview analytics for dashboard stats
 * Includes quick stats like quizzes created, quizzes attempted, average score, and total participants
 */
analyticsRouter.get(
  "/overview",
  generalApiLimiter,
  authMiddleware,
  requireCompletedOnboarding,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    // Validate input (empty object for now)
    const validationResult = getOverviewAnalyticsSchema.safeParse({});
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }

    try {
      const analytics = await getOverviewAnalytics(userId);

      res.json({
        success: true,
        data: {
          analytics,
        },
        message: "Overview analytics retrieved successfully",
      });
    } catch (error) {
      console.error(
        `[Analytics] Error fetching overview analytics for user ${userId}:`,
        error
      );
      throw error;
    }
  })
);

export default analyticsRouter;
