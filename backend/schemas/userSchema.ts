import { z } from "zod";

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
