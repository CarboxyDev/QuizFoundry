import express, { type Router } from "express";
import asyncHandler from "express-async-handler";
import { AppError } from "../errors/AppError";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { authOperationsLimiter } from "../lib/ratelimits";
import {
  getUserById,
  createGoogleUserProfile,
  signupUser,
  loginUser,
} from "../services/userService";
import { getOnboardingProgress } from "../services/onboardingService";
import {
  invalidateSession,
  invalidateAllUserSessions,
  refreshSession,
  getUserSessions,
} from "../services/sessionService";
import { signupSchema, loginSchema } from "../schemas/userSchema";
import type { UserProfile } from "../types/api";

const authRouter: Router = express.Router();

// ! Email/password registration
authRouter.post(
  "/register",
  authOperationsLimiter,
  asyncHandler(async (req, res) => {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => err.message);
      throw new AppError(errors.join("; "), 400);
    }

    const sessionData = {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const loginResponse = await signupUser(validationResult.data, sessionData);
    res.status(201).json({
      success: true,
      data: loginResponse,
      message: "User created successfully",
    });
  })
);

authRouter.post(
  "/login",
  authOperationsLimiter,
  asyncHandler(async (req, res) => {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError("Invalid input data", 400);
    }

    const sessionData = {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const loginResponse = await loginUser(validationResult.data, sessionData);
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
  authOperationsLimiter,
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const userAvatarUrl = req.user?.avatar_url;
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
        avatar_url: userAvatarUrl,
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
      bio: userProfile.bio,
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

authRouter.post(
  "/logout",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.split(" ")[1];

    if (sessionToken) {
      await invalidateSession(sessionToken);
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  })
);

authRouter.post(
  "/logout-all",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    await invalidateAllUserSessions(userId);

    res.json({
      success: true,
      message: "All sessions logged out successfully",
    });
  })
);

authRouter.post(
  "/refresh",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.split(" ")[1];

    if (!sessionToken) {
      throw new AppError("Session token required", 401);
    }

    const refreshedSession = await refreshSession(sessionToken);

    if (!refreshedSession) {
      throw new AppError("Failed to refresh session", 401);
    }

    res.json({
      success: true,
      data: {
        session: {
          access_token: refreshedSession.session_token,
          refresh_token: refreshedSession.refresh_token || "",
          expires_at: Math.floor(
            new Date(refreshedSession.expires_at).getTime() / 1000
          ),
        },
      },
      message: "Session refreshed successfully",
    });
  })
);

authRouter.get(
  "/sessions",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const sessions = await getUserSessions(userId);

    // ! Make sure to remove sensitive data from response
    const safeSessions = sessions.map((session) => ({
      id: session.id,
      created_at: session.created_at,
      updated_at: session.updated_at,
      expires_at: session.expires_at,
      user_agent: session.user_agent,
      ip_address: session.ip_address,
      is_active: session.is_active,
    }));

    res.json({
      success: true,
      data: { sessions: safeSessions },
      message: "Sessions retrieved successfully",
    });
  })
);

export default authRouter;
