"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingProgress } from "@/app/hooks/auth/useOnboarding";
import { AuthGuard } from "./AuthGuard";
import { SpinLoader } from "@/components/Loaders";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

function OnboardingContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: onboardingData, isPending } = useOnboardingProgress();

  useEffect(() => {
    // If onboarding is complete, redirect to dashboard
    if (!isPending && onboardingData?.data?.is_complete) {
      router.push("/dashboard");
    }
  }, [onboardingData, isPending, router]);

  // Show loading while checking onboarding status
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinLoader />
      </div>
    );
  }

  // If onboarding is complete, show loading while redirecting
  if (onboardingData?.data?.is_complete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinLoader />
      </div>
    );
  }

  // Onboarding is not complete - render onboarding page
  return <>{children}</>;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  return (
    <AuthGuard shouldRedirectWhenAuthenticated={false}>
      <OnboardingContent>{children}</OnboardingContent>
    </AuthGuard>
  );
}
