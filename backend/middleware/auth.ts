import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { getUserById } from "../services/userService";
import { getOnboardingProgress } from "../services/onboardingService";
import { supabaseAuth } from "../lib/supabase";

// Type for authenticated user data
export interface AuthenticatedUser {
  id: string;
  email: string;
}

// Extend Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Authentication middleware - verifies JWT token and sets req.user
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Access token required", 401);
    }

    const token = authHeader.split(" ")[1];

    // Verify the Supabase JWT token
    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      throw new AppError("Invalid access token", 401);
    }

    req.user = {
      id: user.id,
      email: user.email || "",
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Invalid access token", 401);
  }
};

/**
 * Onboarding completion middleware - ensures user has completed onboarding
 * Use this for routes that require completed onboarding
 */
export const requireCompletedOnboarding = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new AppError("User not authenticated", 401);
    }

    const onboardingProgress = await getOnboardingProgress(req.user.id);

    if (!onboardingProgress?.is_complete) {
      throw new AppError(
        "Onboarding must be completed to access this resource",
        403
      );
    }

    next();
  } catch (error) {
    throw error;
  }
};
