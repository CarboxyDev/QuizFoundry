import supabase, { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../errors/AppError";
import type {
  CreateUserInput,
  UpdateUserInput,
  SignupInput,
  LoginInput,
} from "../schemas/userSchema";
import type { UserProfile, LoginResponse, ApiResponse } from "../types/api";
import { getOnboardingProgress } from "./onboardingService";

export async function getUsers(): Promise<UserProfile[]> {
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
  const existingUser = await getUserById(id);
  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  const sanitizedData: Record<string, any> = {};

  if (userData.name !== undefined) {
    const trimmedName = userData.name.trim();
    if (trimmedName.length === 0) {
      throw new AppError("Name cannot be empty", 400);
    }
    sanitizedData.name = trimmedName;
  }

  if (userData.bio !== undefined) {
    const trimmedBio = userData.bio.trim();
    sanitizedData.bio = trimmedBio === "" ? null : trimmedBio;
  }

  if (userData.role !== undefined) {
    sanitizedData.role = userData.role;
  }
  if (userData.avatar_url !== undefined) {
    sanitizedData.avatar_url = userData.avatar_url;
  }

  if (Object.keys(sanitizedData).length === 0) {
    throw new AppError("No valid fields to update", 400);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(sanitizedData)
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

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.user || !authData.session) {
    throw new AppError("Invalid email or password", 401);
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    throw new AppError("User profile not found", 404);
  }

  const onboardingProgress = await getOnboardingProgress(authData.user.id);
  const isOnboardingComplete = onboardingProgress?.is_complete || false;

  return {
    user: {
      ...profileData,
      is_onboarding_complete: isOnboardingComplete,
    },
    session: {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at:
        authData.session.expires_at || Math.floor(Date.now() / 1000) + 3600, // Default to 1 hour from now
    },
  };
}

/**
 * Sign up a new user with email/password and create their profile
 * Also logs them in automatically
 */
export async function signupUser(
  signupData: SignupInput
): Promise<LoginResponse> {
  const { email, password, name } = signupData;

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    throw new AppError(
      `Failed to create user: ${authError?.message || "Unknown error"}`,
      400
    );
  }

  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: authData.user.id,
      name: name || null,
      role: null,
      avatar_url: null,
    })
    .select()
    .single();

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw new AppError(
      `Failed to create user profile: ${profileError.message}`,
      500
    );
  }

  // ! Now sign in the user to create a session
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError || !signInData.user || !signInData.session) {
    // In case thje sign-in fails, we should still clean shit up
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    await supabaseAdmin.from("profiles").delete().eq("id", authData.user.id);
    throw new AppError(
      `Failed to sign in after signup: ${signInError?.message || "Unknown error"}`,
      500
    );
  }

  return {
    user: {
      ...profileData,
      is_onboarding_complete: false,
    },
    session: {
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      expires_at:
        signInData.session.expires_at || Math.floor(Date.now() / 1000) + 3600, //  1 hour from now ( potential FIXME )
    },
  };
}

/**
 * Create a new user profile for Google OAuth users
 */
export async function createGoogleUserProfile(userData: {
  id: string;
  email: string;
  avatar_url?: string | null;
}): Promise<UserProfile> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: userData.id,
      name: null,
      role: null,
      avatar_url: userData.avatar_url || null,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(
      `Failed to create Google user profile: ${error.message}`,
      400
    );
  }

  return data;
}

/**
 * Upload user avatar to Supabase Storage
 */
export async function uploadUserAvatar(
  userId: string,
  file: Express.Multer.File
): Promise<{ avatar_url: string }> {
  try {
    if (!file || !file.buffer) {
      throw new AppError("Invalid file data", 400);
    }

    if (file.size === 0) {
      throw new AppError("File is empty", 400);
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
        400
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new AppError("File size exceeds 5MB limit", 400);
    }

    const user = await getUserById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const timestamp = Date.now();
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${userId}/${timestamp}.${fileExtension}`;

    // Upload to Supa Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw new AppError(
        `Failed to upload avatar: ${uploadError.message}`,
        400
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const avatar_url = publicUrlData.publicUrl;

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_url })
      .eq("id", userId)
      .select()
      .single();

    if (profileError) {
      // Cleanup in case the profile avatar update fails
      await supabaseAdmin.storage.from("avatars").remove([fileName]);

      throw new AppError(
        `Failed to update profile: ${profileError.message}`,
        400
      );
    }

    return { avatar_url };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to upload avatar", 500);
  }
}
