import { POST_GOOGLE_PROFILE } from "@/lib/api";
import { axiosInstance } from "@/lib/axios";
import { supabase } from "@/lib/supabase";
import type { ApiResponse, UserProfile } from "@backend/types/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const signUpWithGoogle = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?flow=signup`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }

      // Note: The actual sign-in flow will happen in the callback page
      // after the user is redirected back from Google
    } catch (error: any) {
      console.error("Google sign-up error:", error);
      toast.error(error.message || "Failed to sign up with Google");
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?flow=login`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  const handleAuthCallback = async () => {
    try {
      setIsLoading(true);
      const code = new URLSearchParams(window.location.search).get("code");
      if (!code) {
        throw new Error("No code found");
      }

      try {
        await supabase.auth.exchangeCodeForSession(code);
      } catch (err) {
        console.error("Error exchanging code for session:", err);
        throw err;
      }

      let session = null;
      let attempts = 0;
      const MAX_ATTEMPTS = 5;
      const RETRY_DELAY_MS = 300;

      while (attempts < MAX_ATTEMPTS && !session) {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (currentSession?.user) {
          session = currentSession;
          break;
        }

        attempts += 1;
        if (attempts < MAX_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }

      if (!session?.user) {
        throw new Error("No user session found. Please try again.");
      }

      const user = session.user;

      // Check if user profile exists, if not create one
      try {
        const response = await axiosInstance.post<
          ApiResponse<{ user: UserProfile }>
        >(
          POST_GOOGLE_PROFILE,
          {},
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );

        const userProfile = response.data.data.user;

        // Log the user in with our auth context
        login(userProfile, {
          access_token: session.access_token,
          refresh_token: session.refresh_token || "",
          expires_at:
            session.expires_at || Math.floor(Date.now() / 1000) + 3600,
        });

        // Redirect based on onboarding status
        if (userProfile.is_onboarding_complete) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } catch (profileError: any) {
        console.error("Profile creation error:", profileError);
        throw new Error("Failed to create user profile");
      }
    } catch (error: any) {
      console.error("Auth callback error:", error);
      toast.error(error.message || "Authentication failed");
      router.push("/signup");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUpWithGoogle,
    signInWithGoogle,
    handleAuthCallback,
    isLoading,
  };
}
