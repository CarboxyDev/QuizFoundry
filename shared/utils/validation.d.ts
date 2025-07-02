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
export declare const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements;
/**
 * Validates a password against the requirements
 */
export declare function validatePassword(password: string, requirements?: PasswordRequirements): PasswordValidationResult;
/**
 * Returns a user-friendly list of password requirements
 */
export declare function getPasswordRequirements(requirements?: PasswordRequirements): string[];
