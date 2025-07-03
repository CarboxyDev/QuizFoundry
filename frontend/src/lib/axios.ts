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
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    // Handle different error scenarios
    let message = "Network error. Please try again.";

    if (err?.response?.data) {
      // Backend returned an error response
      const data = err.response.data;
      message = data.error || data.message || "API Error";
    } else if (err?.request) {
      // Request was made but no response received
      message = "Network error. Please check your connection.";
    } else if (err?.message) {
      // Something else happened
      message = err.message;
    }

    return Promise.reject(new Error(message));
  }
);
