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
  id: z.string().uuid(), // auth user id
  name: z.string().min(1).optional(),
  role: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

// Export the inferred types
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
