"use client";

import { ProtectedRouteGuard } from "@/components/AuthGuard";

export default function DashboardPage() {
  return (
    <ProtectedRouteGuard>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your dashboard! You have successfully completed onboarding.
        </p>
      </div>
    </ProtectedRouteGuard>
  );
}
