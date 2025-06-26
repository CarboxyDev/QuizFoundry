import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err?.response?.data?.error || "API Error";
    return Promise.reject(new Error(message));
  }
);
