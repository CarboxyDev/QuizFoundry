import { z } from "zod";
import { validatePassword } from "../../shared/utils/validation";
// Re-export shared types for consistency
export type { SignupInput, LoginInput } from "../../shared/types/api";

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

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
