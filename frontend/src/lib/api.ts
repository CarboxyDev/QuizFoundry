const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const GET_TEST = `${BASE_URL}/meta/test`;
export const POST_REGISTER = `${BASE_URL}/auth/register`;
export const POST_LOGIN = `${BASE_URL}/auth/login`;

// Auth endpoints
export const POST_GOOGLE_PROFILE = `${BASE_URL}/auth/google-profile`;

// Onboarding endpoints
export const GET_ONBOARDING_PROGRESS = `${BASE_URL}/onboarding/progress`;
export const POST_UPDATE_ONBOARDING = `${BASE_URL}/onboarding/update`;
export const POST_COMPLETE_ONBOARDING = `${BASE_URL}/onboarding/complete`;
