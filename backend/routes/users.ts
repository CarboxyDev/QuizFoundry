import express from "express";
import asyncHandler from "express-async-handler";
import multer from "multer";
import { createUserSchema, updateUserSchema } from "../schemas/userSchema";
import { AppError } from "../errors/AppError";
import {
  getUsers,
  getUserById,
  createUserProfile,
  updateUserProfile,
  uploadUserAvatar,
} from "../services/userService";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { sanitizeInput } from "../middleware/sanitization";
import { createCustomRateLimiter } from "../lib/ratelimits";
import type { Router } from "express";

const usersRouter: Router = express.Router();

const userUpdateRateLimit = createCustomRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many profile update requests, please try again later",
});

const avatarUploadRateLimit = createCustomRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many avatar upload requests, please try again later",
});

// Using multer for avatar uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new AppError("Only image files are allowed", 400));
      return;
    }

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!supportedTypes.includes(file.mimetype)) {
      cb(
        new AppError(
          "Unsupported image type. Please use JPEG, PNG, GIF, or WebP",
          400
        )
      );
      return;
    }

    cb(null, true);
  },
});

/**
 * GET /users - List all users (Protected route)
 */
usersRouter.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const users = await getUsers();
    res.json({
      success: true,
      data: users,
    });
  })
);

/**
 * GET /users/:id - Get single user by ID (Protected route)
 */
usersRouter.get(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate UUID format
    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      throw new AppError("Invalid user ID format", 400);
    }

    const user = await getUserById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.json({
      success: true,
      data: user,
    });
  })
);

/**
 * PUT /users/:id - Update user profile
 */
usersRouter.put(
  "/:id",
  authMiddleware,
  userUpdateRateLimit,
  sanitizeInput,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      throw new AppError("Invalid user ID format", 400);
    }

    if (userId !== id) {
      throw new AppError("Access denied", 403);
    }

    const validationResult = updateUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((err) => err.message)
        .join(", ");
      throw new AppError(`Invalid input: ${errors}`, 400);
    }

    const user = await updateUserProfile(id, validationResult.data);
    res.json({
      success: true,
      data: user,
    });
  })
);

/**
 * POST /users/:id/avatar - Upload user avatar
 */
usersRouter.post(
  "/:id/avatar",
  authMiddleware,
  avatarUploadRateLimit,
  upload.single("avatar"),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    // Validate UUID format just in case
    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      throw new AppError("Invalid user ID format", 400);
    }

    if (userId !== id) {
      throw new AppError("Access denied", 403);
    }

    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    if (req.file.size === 0) {
      throw new AppError("Uploaded file is empty", 400);
    }

    // Validate image dimensions (basic check to not fuck shit up)
    if (req.file.buffer.length < 100) {
      throw new AppError("Invalid image file", 400);
    }

    const result = await uploadUserAvatar(id, req.file);

    res.json({
      success: true,
      data: result,
    });
  })
);

export default usersRouter;
