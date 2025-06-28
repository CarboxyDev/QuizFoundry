import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").optional(),
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

export type SignupInput = z.infer<typeof signupSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
