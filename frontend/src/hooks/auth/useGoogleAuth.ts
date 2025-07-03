import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { axiosInstance } from "@/lib/axios";
import { POST_GOOGLE_PROFILE } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, UserProfile } from "@backend/types/api";

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
          redirectTo: `${window.location.origin}/auth/callback`,
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

  const handleAuthCallback = async () => {
    try {
      setIsLoading(true);

      // Get the session from the URL hash
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        throw new Error("No user session found");
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
          }
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
    handleAuthCallback,
    isLoading,
  };
}
