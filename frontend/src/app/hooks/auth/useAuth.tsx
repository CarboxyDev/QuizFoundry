"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { UserProfile, UserSession } from "@shared/types/api";
import {
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth,
  type AuthState,
} from "@/lib/auth";

interface AuthContextType extends AuthState {
  login: (user: UserProfile, session: UserSession) => void;
  logout: () => void;
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

    console.log("Auth initialized:", { user: !!user, session: !!session });

    setAuthState({
      user,
      session,
      isAuthenticated: !!user && !!session,
      isLoading: false,
    });
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

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
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
