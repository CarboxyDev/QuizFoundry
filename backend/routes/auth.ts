import express, { type Router } from "express";
import asyncHandler from "express-async-handler";
import { AppError } from "../errors/AppError";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { getUserById, createGoogleUserProfile } from "../services/userService";
import { getOnboardingProgress } from "../services/onboardingService";
import type { UserProfile } from "../types/api";

const authRouter: Router = express.Router();

/**
 * POST /auth/google-profile - Handle Google OAuth user profile creation
 * This endpoint is called after Google OAuth to ensure user has a profile
 */
authRouter.post(
  "/google-profile",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      throw new AppError("User not authenticated", 401);
    }

    // Check if user profile already exists
    let userProfile = await getUserById(userId);

    if (!userProfile) {
      // Create profile for new Google user
      userProfile = await createGoogleUserProfile({
        id: userId,
        email: userEmail,
      });
    }

    // Check onboarding status
    const onboardingProgress = await getOnboardingProgress(userId);
    const isOnboardingComplete = onboardingProgress?.is_complete || false;

    const profileWithOnboarding: UserProfile = {
      id: userProfile.id!,
      name: userProfile.name,
      role: userProfile.role,
      avatar_url: userProfile.avatar_url,
      created_at: userProfile.created_at,
      is_onboarding_complete: isOnboardingComplete,
    };

    res.json({
      success: true,
      data: {
        user: profileWithOnboarding,
      },
      message: "User profile ready",
    });
  })
);

export default authRouter;
