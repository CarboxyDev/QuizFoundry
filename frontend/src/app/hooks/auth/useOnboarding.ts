import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import {
  GET_ONBOARDING_PROGRESS,
  POST_UPDATE_ONBOARDING,
  POST_COMPLETE_ONBOARDING,
} from "@/lib/api";
import type {
  ApiResponse,
  OnboardingProgress,
  OnboardingData,
  UpdateOnboardingInput,
} from "@shared/types/api";

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
      data: UpdateOnboardingInput
    ): Promise<ApiResponse<OnboardingProgress>> => {
      const res = await axiosInstance.post<ApiResponse<OnboardingProgress>>(
        POST_UPDATE_ONBOARDING,
        data
      );
      return res.data;
    },
  });
}

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: async (
      data: OnboardingData
    ): Promise<ApiResponse<{ success: boolean }>> => {
      const res = await axiosInstance.post<ApiResponse<{ success: boolean }>>(
        POST_COMPLETE_ONBOARDING,
        data
      );
      return res.data;
    },
  });
}
