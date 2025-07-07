import { POST_LOGIN } from "@/lib/api";
import { axiosInstance } from "@/lib/axios";
import type {
  ApiResponse,
  LoginInput,
  LoginResponse,
} from "@backend/types/api";
import { useMutation } from "@tanstack/react-query";

export function useLogin() {
  return useMutation({
    mutationFn: async (
      loginData: LoginInput,
    ): Promise<ApiResponse<LoginResponse>> => {
      const res = await axiosInstance.post<ApiResponse<LoginResponse>>(
        POST_LOGIN,
        loginData,
      );
      return res.data;
    },
  });
}
