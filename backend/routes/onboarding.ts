import express from "express";
import asyncHandler from "express-async-handler";
import {
  updateOnboardingSchema,
  completeOnboardingSchema,
} from "../schemas/onboardingSchemas";
import { AppError } from "../errors/AppError";
import {
  getOnboardingProgress,
  updateOnboardingProgress,
  completeOnboarding,
} from "../services/onboardingService";
import { authMiddleware } from "../middleware/auth";

const onboardingRouter = express.Router();

// Apply auth middleware to all routes
onboardingRouter.use(authMiddleware);

/**
 * GET /onboarding/progress - Get user's onboarding progress
 */
onboardingRouter.get(
  "/progress",
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const progress = await getOnboardingProgress(userId);

    res.json({
      success: true,
      data: progress,
    });
  })
);

/**
 * POST /onboarding/update - Update onboarding progress
 */
onboardingRouter.post(
  "/update",
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const validationResult = updateOnboardingSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError("Invalid input data", 400);
    }

    const progress = await updateOnboardingProgress(
      userId,
      validationResult.data
    );

    res.json({
      success: true,
      data: progress,
      message: "Onboarding progress updated successfully",
    });
  })
);

/**
 * POST /onboarding/complete - Complete onboarding process
 */
onboardingRouter.post(
  "/complete",
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const validationResult = completeOnboardingSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError("Invalid input data", 400);
    }

    const updatedUser = await completeOnboarding(userId, validationResult.data);

    res.json({
      success: true,
      data: {
        user: updatedUser,
      },
      message: "Onboarding completed successfully",
    });
  })
);

export default onboardingRouter;
