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

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 6,
  requireUppercase: false,
  requireLowercase: false,
  requireNumbers: false,
};

/**
 * Validates a password against the requirements
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < requirements.minLength) {
    errors.push(
      `Password must be at least ${requirements.minLength} characters`
    );
  }

  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (requirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Returns a user-friendly list of password requirements
 */
export function getPasswordRequirements(
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): string[] {
  const reqs: string[] = [];

  reqs.push(`At least ${requirements.minLength} characters`);

  if (requirements.requireUppercase) {
    reqs.push("At least one uppercase letter");
  }

  if (requirements.requireLowercase) {
    reqs.push("At least one lowercase letter");
  }

  if (requirements.requireNumbers) {
    reqs.push("At least one number");
  }

  return reqs;
}
