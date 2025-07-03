import { z } from "zod";

// Schema for creating a quiz via AI generation
export const createQuizSchema = z.object({
  prompt: z
    .string()
    .min(10, "Prompt must be at least 10 characters")
    .max(2000, "Prompt must be less than 2000 characters")
    .transform((str) => str.trim()),
  difficulty: z.enum(["easy", "medium", "hard"], {
    required_error: "Difficulty is required",
    invalid_type_error: "Difficulty must be easy, medium, or hard",
  }),
  optionsCount: z
    .number()
    .int()
    .min(2, "Must have at least 2 options")
    .max(8, "Cannot have more than 8 options"),
  questionCount: z
    .number()
    .int()
    .min(1, "Must have at least 1 question")
    .max(20, "Cannot have more than 20 questions"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .optional(),
});

// Schema for manually creating a quiz
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
  is_public: z.boolean().default(true), // Default to public
});

// Schema for updating quiz metadata
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

// Schema for a question option
export const questionOptionSchema = z.object({
  option_text: z
    .string()
    .min(1, "Option text is required")
    .max(500, "Option text must be less than 500 characters"),
  is_correct: z.boolean().default(false),
  order_index: z.number().int().min(0),
});

// Schema for a question
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

// Schema for creating a question
export const createQuestionSchema = questionSchema.extend({
  quiz_id: z.string().uuid("Invalid quiz ID"),
});

// Schema for updating a question
export const updateQuestionSchema = questionSchema.partial().extend({
  id: z.string().uuid("Invalid question ID"),
});

// Schema for quiz with questions (for AI generation response)
export const quizWithQuestionsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questions: z.array(questionSchema),
});

// Type exports for use in services
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type CreateManualQuizInput = z.infer<typeof createManualQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type QuizWithQuestionsInput = z.infer<typeof quizWithQuestionsSchema>;
export type QuestionOptionInput = z.infer<typeof questionOptionSchema>;
