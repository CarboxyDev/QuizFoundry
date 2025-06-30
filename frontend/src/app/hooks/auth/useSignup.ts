import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type {
  ApiResponse,
  SignupInput,
  LoginResponse,
} from "@shared/types/api";
import { POST_SIGNUP } from "@/lib/api";

type SignupResponse = LoginResponse;

export function useSignup() {
  return useMutation({
    mutationFn: async (
      signupData: Omit<SignupInput, "name">
    ): Promise<ApiResponse<SignupResponse>> => {
      const res = await axiosInstance.post<ApiResponse<SignupResponse>>(
        POST_SIGNUP,
        signupData
      );
      return res.data;
    },
  });
}
