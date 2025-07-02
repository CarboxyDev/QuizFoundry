import { z } from "zod";
// Re-export shared types for consistency
export type {
  UpdateOnboardingInput,
  OnboardingData as CompleteOnboardingInput,
} from "../../shared/types/api";

export const updateOnboardingSchema = z.object({
  flow_type: z.string().min(1, "Flow type is required"),
  current_step: z.number().int().min(0),
  is_complete: z.boolean().optional(),
  onboarding_data: z
    .object({
      name: z.string().optional(),
      role: z.string().optional(),
    })
    .optional(),
});

export const completeOnboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
});
