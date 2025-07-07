"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";
import { Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const { handleAuthCallback, isLoading } = useGoogleAuth();
  const searchParams = useSearchParams();
  const flow = searchParams.get("flow");
  const [title, setTitle] = useState("Completing Sign Up...");
  const [subtitle, setSubtitle] = useState(
    "Please wait while we set up your account",
  );

  useEffect(() => {
    if (flow === "login") {
      setTitle("Signing you in...");
      setSubtitle("Please wait while we sign you in");
    } else {
      setTitle("Completing Sign Up...");
      setSubtitle("Please wait while we set up your account");
    }
    handleAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="from-background via-muted/20 to-background flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.1),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.03),transparent_25%)]" />

      <div className="relative z-10 w-full max-w-md">
        <Card className="border-2 shadow-xl">
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4 text-center">
              <div className="from-primary/20 to-primary/10 border-primary/20 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-gradient-to-br">
                <Sparkles className="text-primary h-8 w-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{subtitle}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
