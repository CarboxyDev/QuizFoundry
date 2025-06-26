import express from "express";
import asyncHandler from "express-async-handler";
import { createUserSchema } from "../schemas/userSchema";
import { AppError } from "../errors/AppError";

const usersRouter = express.Router();

usersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError("Invalid input", 400);
    }

    const user = parsed.data;

    // Mock DB operation
    if (user.email === "fail@example.com") {
      throw new AppError("User already exists", 409);
    }

    res.status(201).json({ success: true, user });
  })
);

export default usersRouter;
