"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingProgress } from "@/app/hooks/auth/useOnboarding";
import { useAuth } from "@/app/hooks/auth/useAuth";

interface OnboardingGuardProps {
  children: React.ReactNode;
  redirectTo?: string; // Where to redirect if onboarding is needed
}

export function OnboardingGuard({
  children,
  redirectTo = "/onboarding",
}: OnboardingGuardProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: onboardingData, isLoading: isOnboardingLoading } =
    useOnboardingProgress();

  useEffect(() => {
    // Wait for both auth and onboarding data to load
    if (isAuthLoading || isOnboardingLoading) return;

    // If user is not authenticated, let AuthGuard handle it
    if (!user) return;

    // If user exists but no onboarding data found, redirect to onboarding
    if (!onboardingData?.data) {
      router.push(redirectTo);
      return;
    }

    // If onboarding exists but not complete, redirect to onboarding
    if (!onboardingData.data.is_complete) {
      router.push(redirectTo);
      return;
    }
  }, [
    user,
    onboardingData,
    isAuthLoading,
    isOnboardingLoading,
    router,
    redirectTo,
  ]);

  // Show loading while checking
  if (isAuthLoading || isOnboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, render children (AuthGuard will handle)
  if (!user) {
    return <>{children}</>;
  }

  // If onboarding is incomplete, don't render children (redirect will happen)
  if (!onboardingData?.data?.is_complete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Onboarding is complete, render children
  return <>{children}</>;
}
