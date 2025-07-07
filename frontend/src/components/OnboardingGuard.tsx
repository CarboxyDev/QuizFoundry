"use client";

import { SpinLoader } from "@/components/Loaders";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { isAuthenticated, isOnboardingComplete, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isOnboardingComplete) {
      router.push("/dashboard");
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

  if (!isAuthenticated || isOnboardingComplete) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
