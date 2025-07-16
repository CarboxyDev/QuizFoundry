import { z } from "zod";

// =============================================
// CREATE QUIZ SCHEMAS
// =============================================

// Express Mode Schema - Customizable quiz creation with immediate publishing
export const createQuizExpressModeSchema = z.object({
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
  is_public: z.boolean().default(true),
});

// Advanced Mode Schema - Creates prototype quiz for manual editing
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
  is_public: z.boolean().default(true),
});

// =============================================
// MANUAL MODE SCHEMAS
// =============================================

// Schema for creating a prototype quiz (AI generation but no DB save)
export const createPrototypeQuizSchema = z.object({
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
});

// Schema for publishing a manually edited quiz
export const publishManualQuizSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .transform((str) => str.trim()),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .transform((str) => str.trim())
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  is_public: z.boolean().default(true),
  original_prompt: z
    .string()
    .min(10, "Original prompt must be at least 10 characters")
    .max(2000, "Original prompt must be less than 2000 characters")
    .transform((str) => str.trim())
    .optional(),
  questions: z
    .array(
      z.object({
        question_text: z
          .string()
          .min(10, "Question text must be at least 10 characters")
          .max(500, "Question text must be less than 500 characters")
          .transform((str) => str.trim()),
        question_type: z
          .enum(["multiple_choice", "short_answer"])
          .default("multiple_choice"),
        order_index: z.number().int().min(0),
        options: z
          .array(
            z.object({
              option_text: z
                .string()
                .min(1, "Option text is required")
                .max(200, "Option text must be less than 200 characters")
                .transform((str) => str.trim()),
              is_correct: z.boolean(),
              order_index: z.number().int().min(0),
            })
          )
          .min(2, "Multiple choice questions must have at least 2 options")
          .max(8, "Questions cannot have more than 8 options")
          .refine(
            (options) => options.some((option) => option.is_correct),
            "Each question must have at least one correct answer"
          )
          .refine(
            (options) =>
              options.filter((option) => option.is_correct).length === 1,
            "Each question must have exactly one correct answer"
          ),
      })
    )
    .min(1, "Quiz must have at least 1 question")
    .max(20, "Quiz cannot have more than 20 questions"),
});

// =============================================
// MANUAL QUIZ CREATION SCHEMAS
// =============================================

// Schema for manually creating a quiz (separate from AI generation)
export const createManualQuizSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .transform((str) => str.trim()),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .transform((str) => str.trim())
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
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .transform((str) => str.trim())
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .transform((str) => str.trim())
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  is_public: z.boolean().optional(),
});

// Schema for full quiz updates with questions and options
export const updateQuizWithQuestionsSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .transform((str) => str.trim()),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .transform((str) => str.trim())
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  is_public: z.boolean().default(true),
  questions: z
    .array(
      z.object({
        question_text: z
          .string()
          .min(10, "Question text must be at least 10 characters")
          .max(500, "Question text must be less than 500 characters")
          .transform((str) => str.trim()),
        question_type: z
          .enum(["multiple_choice", "short_answer"])
          .default("multiple_choice"),
        order_index: z.number().int().min(0),
        options: z
          .array(
            z.object({
              option_text: z
                .string()
                .min(1, "Option text is required")
                .max(200, "Option text must be less than 200 characters")
                .transform((str) => str.trim()),
              is_correct: z.boolean(),
              order_index: z.number().int().min(0),
            })
          )
          .min(2, "Multiple choice questions must have at least 2 options")
          .max(8, "Questions cannot have more than 8 options")
          .refine(
            (options) => options.some((option) => option.is_correct),
            "Each question must have at least one correct answer"
          )
          .refine(
            (options) =>
              options.filter((option) => option.is_correct).length === 1,
            "Each question must have exactly one correct answer"
          ),
      })
    )
    .min(1, "Quiz must have at least 1 question")
    .max(20, "Quiz cannot have more than 20 questions"),
});

// =============================================
// QUESTION AND OPTION SCHEMAS
// =============================================

export const questionOptionSchema = z.object({
  option_text: z
    .string()
    .min(1, "Option text is required")
    .max(200, "Option text must be less than 200 characters")
    .transform((str) => str.trim()),
  is_correct: z.boolean().default(false),
  order_index: z.number().int().min(0),
});

export const questionSchema = z.object({
  question_text: z
    .string()
    .min(10, "Question text must be at least 10 characters")
    .max(500, "Question text must be less than 500 characters")
    .transform((str) => str.trim()),
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
export type CreatePrototypeQuizInput = z.infer<
  typeof createPrototypeQuizSchema
>;
export type PublishManualQuizInput = z.infer<typeof publishManualQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type UpdateQuizWithQuestionsInput = z.infer<
  typeof updateQuizWithQuestionsSchema
>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type QuestionOptionInput = z.infer<typeof questionOptionSchema>;

// =============================================
// ANALYTICS SCHEMAS
// =============================================

export const getQuizAnalyticsSchema = z.object({
  quizId: z.string().uuid("Quiz ID must be a valid UUID"),
});

// Creator Analytics Schema - for all quizzes created by a user
export const getCreatorAnalyticsSchema = z.object({});

// Participant Analytics Schema - for all quizzes attempted by a user
export const getParticipantAnalyticsSchema = z.object({});

// Overview Analytics Schema - for dashboard stats
export const getOverviewAnalyticsSchema = z.object({});

export type GetQuizAnalyticsInput = z.infer<typeof getQuizAnalyticsSchema>;
export type GetCreatorAnalyticsInput = z.infer<
  typeof getCreatorAnalyticsSchema
>;
export type GetParticipantAnalyticsInput = z.infer<
  typeof getParticipantAnalyticsSchema
>;
export type GetOverviewAnalyticsInput = z.infer<
  typeof getOverviewAnalyticsSchema
>;
