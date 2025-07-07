import {
  GET_ONBOARDING_PROGRESS,
  POST_COMPLETE_ONBOARDING,
  POST_UPDATE_ONBOARDING,
} from "@/lib/api";
import { axiosInstance } from "@/lib/axios";
import type {
  ApiResponse,
  OnboardingData,
  OnboardingProgress,
  UpdateOnboardingInput,
  UserProfile,
} from "@backend/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useOnboardingProgress() {
  return useQuery({
    queryKey: ["onboarding-progress"],
    queryFn: async (): Promise<ApiResponse<OnboardingProgress | null>> => {
      const res = await axiosInstance.get<
        ApiResponse<OnboardingProgress | null>
      >(GET_ONBOARDING_PROGRESS);
      return res.data;
    },
  });
}

export function useUpdateOnboarding() {
  return useMutation({
    mutationFn: async (
      data: UpdateOnboardingInput,
    ): Promise<ApiResponse<OnboardingProgress>> => {
      const res = await axiosInstance.post<ApiResponse<OnboardingProgress>>(
        POST_UPDATE_ONBOARDING,
        data,
      );
      return res.data;
    },
  });
}

interface CompleteOnboardingResponse {
  user: UserProfile;
}

export function useCompleteOnboarding() {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: async (data: OnboardingData) => {
      const response = await axiosInstance.post<
        ApiResponse<CompleteOnboardingResponse>
      >(POST_COMPLETE_ONBOARDING, data);
      return response.data;
    },
    onSuccess: (response) => {
      // Update the user in the auth context with the completed onboarding status
      if (response.data.user) {
        updateUser(response.data.user);
      }
    },
  });
}
