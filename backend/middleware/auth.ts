import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { getUserById } from "../services/userService";
import { getOnboardingProgress } from "../services/onboardingService";
import { validateSession } from "../services/sessionService";

// Type for authenticated user data
export interface AuthenticatedUser {
  id: string;
  email: string;
  avatar_url?: string | null;
}

// Extend Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Authentication middleware - verifies session token and sets req.user
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Session token required", 401);
    }

    const sessionToken = authHeader.split(" ")[1];

    // Validate the session token
    const validation = await validateSession(sessionToken);

    if (!validation.isValid || !validation.user) {
      throw new AppError("Invalid or expired session", 401);
    }

    req.user = {
      id: validation.user.id,
      email: validation.user.email,
      avatar_url: validation.user.avatar_url,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Invalid session token", 401);
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
