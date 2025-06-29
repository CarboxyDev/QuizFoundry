const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2003/api";

export const GET_TEST = `${BASE_URL}/meta/test`;
export const POST_SIGNUP = `${BASE_URL}/users/sign-up`;
export const POST_LOGIN = `${BASE_URL}/users/login`;
