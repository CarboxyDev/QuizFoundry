import { POST_REGISTER } from "@/lib/api";
import { axiosInstance } from "@/lib/axios";
import type {
  ApiResponse,
  LoginResponse,
  SignupInput,
} from "@backend/types/api";
import { useMutation } from "@tanstack/react-query";

type SignupResponse = LoginResponse;

export function useSignup() {
  return useMutation({
    mutationFn: async (
      signupData: Omit<SignupInput, "name">,
    ): Promise<ApiResponse<SignupResponse>> => {
      try {
        const res = await axiosInstance.post<ApiResponse<SignupResponse>>(
          POST_REGISTER,
          signupData,
        );
        return res.data;
      } catch (error: any) {
        // Enhanced error handling for validation errors
        const errorMessage = error?.message || "Signup failed";
        throw new Error(errorMessage);
      }
    },
  });
}
