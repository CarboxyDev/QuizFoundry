import type { UserProfile, UserSession } from "@shared/types/api";

export interface AuthState {
  user: UserProfile | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const getStoredAuth = (): {
  user: UserProfile | null;
  session: UserSession | null;
} => {
  if (typeof window === "undefined") {
    return { user: null, session: null };
  }

  try {
    const userStr = localStorage.getItem("user");
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    const expiresAt = localStorage.getItem("expires_at");

    if (!userStr || !accessToken || !refreshToken) {
      return { user: null, session: null };
    }

    const user = JSON.parse(userStr) as UserProfile;
    const session: UserSession = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt ? parseInt(expiresAt) : 0,
    };

    // Check if token is expired
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      console.log("Token expired, clearing auth");
      clearStoredAuth();
      return { user: null, session: null };
    }

    return { user, session };
  } catch (error) {
    console.error("Error parsing stored auth:", error);
    clearStoredAuth();
    return { user: null, session: null };
  }
};

export const setStoredAuth = (
  user: UserProfile,
  session: UserSession
): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("access_token", session.access_token);
  localStorage.setItem("refresh_token", session.refresh_token);
  localStorage.setItem("expires_at", session.expires_at.toString());
};

export const clearStoredAuth = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("user");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("expires_at");
};

export const isTokenExpired = (expiresAt: number): boolean => {
  return expiresAt * 1000 < Date.now();
};
