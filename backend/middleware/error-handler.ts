import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : "Internal Server Error";

  // Log error with request context
  console.error(`[ERROR] ${req.method} ${req.path}:`, {
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    userId: (req as any).user?.id || "anonymous",
    timestamp: new Date().toISOString(),
  });

  res.status(statusCode).json({ success: false, error: message });
}
