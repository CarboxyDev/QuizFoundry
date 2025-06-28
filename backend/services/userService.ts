import supabase from "../lib/supabase";
import { AppError } from "../errors/AppError";
import type { CreateUserInput, UpdateUserInput } from "../schemas/userSchema";

export interface UserProfile {
  id: string;
  name: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
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
