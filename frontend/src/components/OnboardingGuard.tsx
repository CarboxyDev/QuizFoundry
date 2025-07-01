"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/auth/useAuth";
import { SpinLoader } from "@/components/Loaders";

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
      <div className="min-h-screen flex items-center justify-center">
        <SpinLoader />
      </div>
    );
  }

  if (!isAuthenticated || isOnboardingComplete) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
