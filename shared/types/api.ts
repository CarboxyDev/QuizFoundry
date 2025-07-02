export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SignupInput {
  email: string;
  /**
   * Password requirements:
   * - At least 6 characters
   */
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
  is_onboarding_complete: boolean;
}

export interface OnboardingProgress {
  user_id: string;
  flow_type: string;
  current_step: number;
  is_complete: boolean;
  started_at: string;
  completed_at?: string;
}

export interface OnboardingData {
  name: string;
  role: string;
}

export interface PartialOnboardingData {
  name?: string;
  role?: string;
}

export interface UpdateOnboardingInput {
  flow_type: string;
  current_step: number;
  is_complete?: boolean;
  onboarding_data?: PartialOnboardingData;
}
