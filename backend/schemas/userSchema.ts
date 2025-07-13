import { validatePassword } from "../utils/validation";
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().refine(
    (password) => {
      const validation = validatePassword(password);
      return validation.isValid;
    },
    (password) => {
      const validation = validatePassword(password);
      return {
        message: validation.errors.join("; "),
      };
    }
  ),
  name: z.string().min(1, "Name is required").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  role: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .refine(
      (val) => val.trim().length > 0,
      "Name cannot be empty or whitespace only"
    )
    .optional(),
  role: z.string().optional(),
  avatar_url: z.string().url().optional(),
  bio: z
    .string()
    .max(500, "Bio must not exceed 500 characters")
    .refine(
      (val) => val === "" || val.trim().length > 0,
      "Bio cannot contain only whitespace"
    )
    .optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
