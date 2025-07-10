"use client";

import { DashboardCards } from "@/app/(dashboard)/dashboard/DashboardCards";
import { GettingStarted } from "@/app/(dashboard)/dashboard/GettingStarted";
import { useAuth } from "@/hooks/auth/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <div className="mx-auto max-w-4xl p-6">
          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-bold tracking-tight">
              Welcome back, {user?.name || "there"}!
            </h2>
            <p className="text-muted-foreground">
              Ready to create and take some amazing AI-powered quizzes?
            </p>
          </div>
          <GettingStarted />
          <div className="mt-8">
            <DashboardCards />
          </div>
        </div>
      </div>
    </div>
  );
}
