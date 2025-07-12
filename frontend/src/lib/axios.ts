import axios from "axios";
import { getStoredAuth } from "./auth";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const { session } = getStoredAuth();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.data) {
      const errorData = err.response.data;

      if (errorData.error && typeof errorData.error === "string") {
        const enhancedError = new Error(errorData.error);

        if (errorData.details) {
          (enhancedError as any).details = errorData.details;
        }

        if (errorData.validation_result) {
          (enhancedError as any).validationResult = errorData.validation_result;
        }

        if (errorData.code) {
          (enhancedError as any).code = errorData.code;
        }

        (enhancedError as any).response = err.response;

        return Promise.reject(enhancedError);
      }

      if (errorData.message) {
        const enhancedError = new Error(errorData.message);
        (enhancedError as any).response = err.response;
        return Promise.reject(enhancedError);
      }
    }

    const message =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "API Error";

    const enhancedError = new Error(message);
    (enhancedError as any).response = err.response;
    return Promise.reject(enhancedError);
  },
);
