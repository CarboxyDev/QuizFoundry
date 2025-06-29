export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface LoginResponse {
  user: UserProfile;
  session: UserSession;
}

export interface UserProfile {
  id: string;
  name: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
}
