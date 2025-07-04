import express, { type Router } from "express";
import asyncHandler from "express-async-handler";
import { AppError } from "../errors/AppError";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import {
  getUserById,
  createGoogleUserProfile,
  signupUser,
  loginUser,
} from "../services/userService";
import { getOnboardingProgress } from "../services/onboardingService";
import { signupSchema, loginSchema } from "../schemas/userSchema";
import type { UserProfile } from "../types/api";

const authRouter: Router = express.Router();

// Email/password registration
/**
 * POST /auth/register - Sign up new user and automatically log them in
 */
authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }
    const loginResponse = await signupUser(validationResult.data);
    res.status(201).json({
      success: true,
      data: loginResponse,
      message: "User created successfully",
    });
  })
);

/**
 * POST /auth/login - Login user
 */
authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError("Invalid input data", 400);
    }
    const loginResponse = await loginUser(validationResult.data);
    res.json({
      success: true,
      data: loginResponse,
      message: "Login successful",
    });
  })
);

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
