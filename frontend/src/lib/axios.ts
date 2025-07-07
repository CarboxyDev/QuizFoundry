import axios from "axios";
import { getStoredAuth } from "./auth";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
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
    const message = err?.response?.data?.error || "API Error";
    return Promise.reject(new Error(message));
  },
);
