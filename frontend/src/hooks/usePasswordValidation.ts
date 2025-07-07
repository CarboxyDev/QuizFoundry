import { getPasswordRequirements, validatePassword } from "@/lib/validation";
import { useMemo } from "react";

export interface UsePasswordValidationResult {
  isValid: boolean;
  errors: string[];
  requirements: string[];
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
}

export function usePasswordValidation(
  password: string,
): UsePasswordValidationResult {
  return useMemo(() => {
    const validation = validatePassword(password);
    const requirements = getPasswordRequirements();

    return {
      isValid: validation.isValid,
      errors: validation.errors,
      requirements,
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
    };
  }, [password]);
}
