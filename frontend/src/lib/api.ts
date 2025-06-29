const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2003/api";

export const GET_TEST = `${BASE_URL}/meta/test`;
export const POST_SIGNUP = `${BASE_URL}/users/sign-up`;
export const POST_LOGIN = `${BASE_URL}/users/login`;

// Onboarding endpoints
export const GET_ONBOARDING_PROGRESS = `${BASE_URL}/onboarding/progress`;
export const POST_UPDATE_ONBOARDING = `${BASE_URL}/onboarding/update`;
export const POST_COMPLETE_ONBOARDING = `${BASE_URL}/onboarding/complete`;
