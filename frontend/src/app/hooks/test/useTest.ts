import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { ApiResponse } from "@shared/types/api";
import { GET_TEST } from "@/lib/api";

type TestResponse = {
  message: string;
};

export function useTest() {
  return useQuery({
    queryKey: ["test"],
    queryFn: async (): Promise<ApiResponse<TestResponse>> => {
      const res = await axios.get<ApiResponse<TestResponse>>(GET_TEST);
      return res.data;
    },
  });
}
