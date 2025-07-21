import rateLimit from "express-rate-limit";
import type { Request } from "express";

const MINUTES = 60 * 1000;

/**
 *
 * 1. AI_OPERATIONS: For AI-powered quiz generation (most restrictive)
 * 2. CREATIVE_PROMPTS: For AI-powered creative prompt generation
 * 3. GENERAL_API: For regular API operations (baseline protection)
 * 4. AUTH_OPERATIONS: For authentication-related endpoints
 *
 * Environment Variables:
 * - Set SKIP_RATE_LIMITS=true in development to bypass rate limiting
 *
 * Based on:
 * - Uses user ID for authenticated requests
 * - Falls back to IP address for anonymous requests
 *
 */

export const RATE_LIMIT_CONFIG = {
  AI_OPERATIONS: {
    windowMs: 30 * MINUTES,
    max: 30,
    message: {
      error: "Too many AI requests",
      message:
        "You've reached the limit for AI-powered quiz generation. Please try again later.",
      retryAfter: "30 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  CREATIVE_PROMPTS: {
    windowMs: 5 * MINUTES,
    max: 20,
    message: {
      error: "Too many creative prompt requests",
      message:
        "You've reached the limit for surprise quiz prompts. Please try again in a few minutes.",
      retryAfter: "5 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  GENERAL_API: {
    windowMs: 15 * MINUTES,
    max: 200,
    message: {
      error: "Too many requests",
      message: "You've made too many requests. Please try again later.",
      retryAfter: "15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  AUTH_OPERATIONS: {
    windowMs: 15 * MINUTES,
    max: 40,
    message: {
      error: "Too many authentication attempts",
      message: "Too many authentication attempts. Please try again later.",
      retryAfter: "15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  SECURITY_VALIDATION: {
    windowMs: 10 * MINUTES,
    max: 50,
    message: {
      error: "Too many security validation requests",
      message: "You've reached the limit for content security validation. Please try again later.",
      retryAfter: "10 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
} as const;

const generateKeyFromUser = (req: Request): string => {
  const authReq = req as Request & { user?: { id: string } };
  return authReq.user?.id || req.ip || "anonymous";
};

export const aiOperationsLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG.AI_OPERATIONS,
  keyGenerator: generateKeyFromUser,
  skip: (req) => {
    return (
      process.env.NODE_ENV === "development" &&
      process.env.SKIP_RATE_LIMITS === "true"
    );
  },
});

export const creativePromptsLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG.CREATIVE_PROMPTS,
  keyGenerator: generateKeyFromUser,
  skip: (req) => {
    return (
      process.env.NODE_ENV === "development" &&
      process.env.SKIP_RATE_LIMITS === "true"
    );
  },
});

export const generalApiLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG.GENERAL_API,
  keyGenerator: generateKeyFromUser,
  skip: (req) => {
    return (
      process.env.NODE_ENV === "development" &&
      process.env.SKIP_RATE_LIMITS === "true"
    );
  },
});

export const authOperationsLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG.AUTH_OPERATIONS,
  keyGenerator: generateKeyFromUser,
  skip: (req) => {
    return (
      process.env.NODE_ENV === "development" &&
      process.env.SKIP_RATE_LIMITS === "true"
    );
  },
});

export const securityValidationLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG.SECURITY_VALIDATION,
  keyGenerator: generateKeyFromUser,
  skip: (req) => {
    return (
      process.env.NODE_ENV === "development" &&
      process.env.SKIP_RATE_LIMITS === "true"
    );
  },
});

export const createCustomRateLimiter = (config: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: {
      error: "Rate limit exceeded",
      message: config.message,
    },
    keyGenerator: generateKeyFromUser,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: config.skipSuccessfulRequests || false,
    skip: (req) => {
      return (
        process.env.NODE_ENV === "development" &&
        process.env.SKIP_RATE_LIMITS === "true"
      );
    },
  });
};
