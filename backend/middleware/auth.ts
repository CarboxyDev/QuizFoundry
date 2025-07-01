import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { getUserById } from "../services/userService";
import { getOnboardingProgress } from "../services/onboardingService";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * Authentication middleware - verifies JWT token and sets req.user
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Access token required", 401);
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.SUPABASE_JWT_SECRET;

    if (!secret) {
      throw new AppError("JWT secret not configured", 500);
    }

    const decoded = jwt.verify(token, secret) as any;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid access token", 401);
    }
    throw error;
  }
};

/**
 * Onboarding completion middleware - ensures user has completed onboarding
 * Use this for routes that require completed onboarding
 */
export const requireCompletedOnboarding = async (
  req: Request,
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
