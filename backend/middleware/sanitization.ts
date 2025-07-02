import { Request, Response, NextFunction } from "express";

/**
 * Basic input sanitization middleware
 * Trims whitespace and removes potential XSS patterns
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body && typeof req.body === "object") {
    sanitizeObject(req.body);
  }
  next();
};

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (typeof value === "string") {
        // Trim whitespace and remove potential script tags
        obj[key] = value
          .trim()
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+=/gi, "");
      } else if (typeof value === "object" && value !== null) {
        sanitizeObject(value);
      }
    }
  }
}
