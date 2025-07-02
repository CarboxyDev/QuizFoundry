"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PASSWORD_REQUIREMENTS = void 0;
exports.validatePassword = validatePassword;
exports.getPasswordRequirements = getPasswordRequirements;
exports.DEFAULT_PASSWORD_REQUIREMENTS = {
    minLength: 6,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
};
/**
 * Validates a password against the requirements
 */
function validatePassword(password, requirements = exports.DEFAULT_PASSWORD_REQUIREMENTS) {
    const errors = [];
    if (password.length < requirements.minLength) {
        errors.push(`Password must be at least ${requirements.minLength} characters`);
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
function getPasswordRequirements(requirements = exports.DEFAULT_PASSWORD_REQUIREMENTS) {
    const reqs = [];
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
