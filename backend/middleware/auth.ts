import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { supabaseAdmin } from "../lib/supabase";

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
 * Middleware to authenticate requests using Supabase JWT token
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the JWT token with Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      throw new AppError("Invalid or expired token", 401);
    }

    // Add user info to request object
    req.user = {
      id: data.user.id,
      email: data.user.email || "",
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Authentication failed", 401));
    }
  }
}
