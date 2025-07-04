import express from "express";
import asyncHandler from "express-async-handler";
import { createUserSchema, updateUserSchema } from "../schemas/userSchema";
import { AppError } from "../errors/AppError";
import {
  getUsers,
  getUserById,
  createUserProfile,
  updateUserProfile,
} from "../services/userService";
import { authMiddleware } from "../middleware/auth";
import type { Router } from "express";

const usersRouter: Router = express.Router();

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
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validationResult = updateUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new AppError("Invalid input data", 400);
    }
    const user = await updateUserProfile(id, validationResult.data);
    res.json({
      success: true,
      data: user,
    });
  })
);

export default usersRouter;
