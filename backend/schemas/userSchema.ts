import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
