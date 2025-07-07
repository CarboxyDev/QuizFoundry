"use client";

import { SpinLoader } from "@/components/Loaders";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  shouldRedirectWhenAuthenticated?: boolean;
  requireOnboarding?: boolean;
}

export function AuthGuard({
  children,
  redirectTo = "/dashboard",
  shouldRedirectWhenAuthenticated = true,
  requireOnboarding = false,
}: AuthGuardProps) {
  const { isAuthenticated, isOnboardingComplete, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Not authenticated, let auth pages render
      return;
    }

    if (shouldRedirectWhenAuthenticated) {
      // Check onboarding status for authenticated users
      if (!isOnboardingComplete) {
        router.push("/onboarding");
        return;
      }

      // User is authenticated and onboarded, redirect to main app
      router.push(redirectTo);
    }
  }, [
    isAuthenticated,
    isOnboardingComplete,
    isLoading,
    router,
    redirectTo,
    shouldRedirectWhenAuthenticated,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <SpinLoader />
      </div>
    );
  }

  // For auth pages (login, signup)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // For protected pages that don't require onboarding (like onboarding page itself)
  if (!requireOnboarding && shouldRedirectWhenAuthenticated) {
    return null; // Will redirect
  }

  // For protected pages that require onboarding
  if (requireOnboarding && !isOnboardingComplete) {
    router.push("/onboarding");
    return null;
  }

  return <>{children}</>;
}

/**
 * Guard for routes that require completed onboarding
 */
export function ProtectedRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isOnboardingComplete, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isOnboardingComplete) {
      router.push("/onboarding");
      return;
    }
  }, [isAuthenticated, isOnboardingComplete, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <SpinLoader />
      </div>
    );
  }

  if (!isAuthenticated || !isOnboardingComplete) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
