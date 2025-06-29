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
export interface UserProfile {
    id: string;
    name: string | null;
    role: string | null;
    avatar_url: string | null;
    created_at: string;
}
