"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/auth/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { SpinLoader } from "@/components/Loaders";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  shouldRedirectWhenAuthenticated?: boolean;
}

export function AuthGuard({
  children,
  redirectTo = "/dashboard",
  shouldRedirectWhenAuthenticated = true,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && shouldRedirectWhenAuthenticated) {
      router.push(redirectTo);
    }
  }, [
    isAuthenticated,
    isLoading,
    router,
    redirectTo,
    shouldRedirectWhenAuthenticated,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinLoader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (shouldRedirectWhenAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
