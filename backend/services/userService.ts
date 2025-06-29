import supabase from "../lib/supabase";
import { AppError } from "../errors/AppError";
import type {
  CreateUserInput,
  UpdateUserInput,
  SignupInput,
  LoginInput,
} from "../schemas/userSchema";

export interface UserProfile {
  id: string;
  name: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface LoginResponse {
  user: UserProfile;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(`Failed to fetch users: ${error.message}`, 500);
  }

  return data || [];
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new AppError(`Failed to fetch user: ${error.message}`, 500);
  }

  return data;
}

/**
 * Create a new user profile
 * ! Important Note: The auth user should already exist in auth.users table
 */
export async function createUserProfile(
  userData: CreateUserInput
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userData.id,
      name: userData.name || null,
      role: userData.role || null,
      avatar_url: userData.avatar_url || null,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(`Failed to create user profile: ${error.message}`, 400);
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  id: string,
  userData: UpdateUserInput
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(userData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("User not found", 404);
    }
    throw new AppError(`Failed to update user profile: ${error.message}`, 400);
  }

  return data;
}

/**
 * Login user with email/password
 */
export async function loginUser(loginData: LoginInput): Promise<LoginResponse> {
  const { email, password } = loginData;

  // Authenticate user with Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.user || !authData.session) {
    throw new AppError("Invalid email or password", 401);
  }

  // Get user profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    throw new AppError("User profile not found", 404);
  }

  return {
    user: profileData,
    session: {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at || 0,
    },
  };
}

/**
 * Sign up a new user with email/password and create their profile
 */
export async function signupUser(
  signupData: SignupInput
): Promise<UserProfile> {
  const { email, password, name } = signupData;

  // Create user in Supabase Auth using admin client
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
    });

  if (authError || !authData.user) {
    throw new AppError(
      `Failed to create user: ${authError?.message || "Unknown error"}`,
      400
    );
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      name: name || null,
      role: null, // FIXME: Add roles in future
      avatar_url: null,
    })
    .select()
    .single();

  // In case profile creation fails, clean up the auth user
  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new AppError(
      `Failed to create user profile: ${profileError.message}`,
      500
    );
  }

  return profileData;
}
