import supabase, { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../errors/AppError";
import type {
  UpdateOnboardingInput,
  CompleteOnboardingInput,
} from "../schemas/onboardingSchemas";
import type { UserProfile } from "./userService";

export interface OnboardingProgress {
  user_id: string;
  flow_type: string;
  current_step: number;
  is_complete: boolean;
  started_at: string;
  completed_at?: string;
}

/**
 * Get onboarding progress for a user
 */
export async function getOnboardingProgress(
  userId: string
): Promise<OnboardingProgress | null> {
  const { data, error } = await supabaseAdmin
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No onboarding progress found
    }
    throw new AppError(
      `Failed to fetch onboarding progress: ${error.message}`,
      500
    );
  }

  return data;
}

/**
 * Update onboarding progress
 */
export async function updateOnboardingProgress(
  userId: string,
  progressData: UpdateOnboardingInput
): Promise<OnboardingProgress> {
  // Check if onboarding progress already exists
  const existingProgress = await getOnboardingProgress(userId);

  if (existingProgress) {
    // Update existing progress
    const { data, error } = await supabaseAdmin
      .from("onboarding_progress")
      .update({
        flow_type: progressData.flow_type,
        current_step: progressData.current_step,
        is_complete: progressData.is_complete || false,
        completed_at: progressData.is_complete
          ? new Date().toISOString()
          : null,
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to update onboarding progress: ${error.message}`,
        400
      );
    }

    return data;
  } else {
    // Create new progress record
    const { data, error } = await supabaseAdmin
      .from("onboarding_progress")
      .insert({
        user_id: userId,
        flow_type: progressData.flow_type,
        current_step: progressData.current_step,
        is_complete: progressData.is_complete || false,
        completed_at: progressData.is_complete
          ? new Date().toISOString()
          : null,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to create onboarding progress: ${error.message}`,
        400
      );
    }

    return data;
  }
}

/**
 * Complete onboarding - update profile and mark progress as complete
 */
export async function completeOnboarding(
  userId: string,
  onboardingData: CompleteOnboardingInput
): Promise<UserProfile> {
  try {
    // Update user profile with onboarding data
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        name: onboardingData.name,
        role: onboardingData.role,
      })
      .eq("id", userId)
      .select()
      .single();

    if (profileError) {
      throw new AppError(
        `Failed to update profile: ${profileError.message}`,
        400
      );
    }

    // Mark onboarding as complete
    await updateOnboardingProgress(userId, {
      flow_type: "default",
      current_step: 2,
      is_complete: true,
    });

    return {
      ...profileData,
      is_onboarding_complete: true,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to complete onboarding", 500);
  }
}
