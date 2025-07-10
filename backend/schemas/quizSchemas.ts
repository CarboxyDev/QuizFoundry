import { z } from "zod";

// =============================================
// CREATE QUIZ SCHEMAS
// =============================================

// Express Mode Schema - Simple quiz creation with defaults
export const createQuizExpressModeSchema = z.object({
  prompt: z
    .string()
    .min(10, "Prompt must be at least 10 characters")
    .max(2000, "Prompt must be less than 2000 characters")
    .transform((str) => str.trim()),
  is_public: z.boolean().default(true),
});

// Advanced Mode Schema - Custom settings with optional Manual Mode
export const createQuizAdvancedModeSchema = z.object({
  prompt: z
    .string()
    .min(10, "Prompt must be at least 10 characters")
    .max(2000, "Prompt must be less than 2000 characters")
    .transform((str) => str.trim()),
  questionCount: z
    .number()
    .int()
    .min(3, "Must have at least 3 questions")
    .max(20, "Cannot have more than 20 questions"),
  optionsCount: z
    .number()
    .int()
    .min(2, "Must have at least 2 options")
    .max(8, "Cannot have more than 8 options"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    required_error: "Difficulty is required",
    invalid_type_error: "Difficulty must be easy, medium, or hard",
  }),
  isManualMode: z.boolean().default(false),
  is_public: z.boolean().default(true),
});

// =============================================
// MANUAL QUIZ CREATION SCHEMAS
// =============================================

// Schema for manually creating a quiz (separate from AI generation)
export const createManualQuizSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  is_public: z.boolean().default(true),
});

// =============================================
// QUIZ UPDATE SCHEMAS
// =============================================

export const updateQuizSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  is_public: z.boolean().optional(),
});

// =============================================
// QUESTION AND OPTION SCHEMAS
// =============================================

export const questionOptionSchema = z.object({
  option_text: z
    .string()
    .min(1, "Option text is required")
    .max(500, "Option text must be less than 500 characters"),
  is_correct: z.boolean().default(false),
  order_index: z.number().int().min(0),
});

export const questionSchema = z.object({
  question_text: z
    .string()
    .min(1, "Question text is required")
    .max(1000, "Question text must be less than 1000 characters"),
  question_type: z
    .enum(["multiple_choice", "short_answer"])
    .default("multiple_choice"),
  order_index: z.number().int().min(0),
  options: z
    .array(questionOptionSchema)
    .min(2, "Multiple choice questions must have at least 2 options")
    .max(8, "Questions cannot have more than 8 options")
    .optional(),
});

export const createQuestionSchema = questionSchema.extend({
  quiz_id: z.string().uuid("Invalid quiz ID"),
});

export const updateQuestionSchema = questionSchema.partial().extend({
  id: z.string().uuid("Invalid question ID"),
});

// =============================================
// TYPE EXPORTS
// =============================================

export type CreateQuizExpressModeInput = z.infer<
  typeof createQuizExpressModeSchema
>;
export type CreateQuizAdvancedModeInput = z.infer<
  typeof createQuizAdvancedModeSchema
>;
export type CreateManualQuizInput = z.infer<typeof createManualQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type QuestionOptionInput = z.infer<typeof questionOptionSchema>;
