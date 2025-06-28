import express from "express";
import asyncHandler from "express-async-handler";
import {
  createUserSchema,
  updateUserSchema,
  signupSchema,
} from "../schemas/userSchema";
import { AppError } from "../errors/AppError";
import {
  getAllUsers,
  getUserById,
  createUserProfile,
  updateUserProfile,
  signupUser,
} from "../services/userService";

const usersRouter = express.Router();

/**
 * POST /users/sign-up - Sign up new user
 */
usersRouter.post(
  "/sign-up",
  asyncHandler(async (req, res) => {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError("Invalid input data", 400);
    }

    const user = await signupUser(validationResult.data);

    res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  })
);

/**
 * GET /users - List all users
 */
usersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const users = await getAllUsers();
    res.json({
      success: true,
      data: users,
    });
  })
);

/**
 * GET /users/:id - Get single user by ID
 */
usersRouter.get(
  "/:id",
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
