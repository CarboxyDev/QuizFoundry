"use client";

import {
  clearStoredAuth,
  getStoredAuth,
  isTokenExpired,
  refreshAuthSession,
  setStoredAuth,
  type AuthState,
} from "@/lib/auth";
import type { UserProfile, UserSession } from "@backend/types/api";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType extends AuthState {
  login: (user: UserProfile, session: UserSession) => void;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
  isOnboardingComplete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const router = useRouter();

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    const { user, session } = getStoredAuth();
    const checkAndRefresh = async () => {
      if (session && isTokenExpired(session.expires_at)) {
        const refreshed = await refreshAuthSession();
        setAuthState({
          user: refreshed.user,
          session: refreshed.session,
          isAuthenticated: !!refreshed.user && !!refreshed.session,
          isLoading: false,
        });
        return;
      }
      setAuthState({
        user,
        session,
        isAuthenticated: !!user && !!session,
        isLoading: false,
      });
    };
    checkAndRefresh();
  }, []);

  const login = (user: UserProfile, session: UserSession) => {
    setStoredAuth(user, session);
    setAuthState({
      user,
      session,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const updateUser = (user: UserProfile) => {
    if (authState.session) {
      setStoredAuth(user, authState.session);
      setAuthState((prev) => ({
        ...prev,
        user,
      }));
    }
  };

  const logout = () => {
    clearStoredAuth();
    setAuthState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push("/login");
  };

  const isOnboardingComplete = authState.user?.is_onboarding_complete ?? false;

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser,
    isOnboardingComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
