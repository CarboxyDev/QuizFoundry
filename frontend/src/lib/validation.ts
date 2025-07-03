export interface QuizFormData {
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  optionsCount: number;
  questionCount: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateQuizForm(data: QuizFormData): ValidationResult {
  const errors: string[] = [];

  // Validate prompt
  if (!data.prompt.trim()) {
    errors.push("Please enter a quiz prompt");
  } else if (data.prompt.trim().length < 10) {
    errors.push(
      "Please provide a more detailed prompt (at least 10 characters)"
    );
  } else if (data.prompt.trim().length > 2000) {
    errors.push("Prompt is too long (maximum 2000 characters)");
  }

  // Validate difficulty
  if (!["easy", "medium", "hard"].includes(data.difficulty)) {
    errors.push("Please select a valid difficulty level");
  }

  // Validate options count
  if (data.optionsCount < 2 || data.optionsCount > 8) {
    errors.push("Options count must be between 2 and 8");
  }

  // Validate question count
  if (data.questionCount < 1 || data.questionCount > 20) {
    errors.push("Question count must be between 1 and 20");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function sanitizeQuizPrompt(prompt: string): string {
  return prompt
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[<>]/g, ""); // Remove potential HTML tags
}
