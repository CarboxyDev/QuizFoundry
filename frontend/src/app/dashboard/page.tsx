"use client";

import { ProtectedRouteGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth/useAuth";
import { LogOut, Plus, Sparkles, User, Users } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRouteGuard>
      <div className="from-background via-muted/20 to-background flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.1),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.03),transparent_25%)]" />

        <Card className="relative z-10 w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <User className="text-primary h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || "there"}!
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-2 text-sm">
                You have successfully completed onboarding.
              </p>
              {user?.role && (
                <p className="text-muted-foreground text-xs">
                  Role: {user.role}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-center text-sm font-medium">Quick Actions</h3>
              <div className="grid gap-3">
                <Link href="/create-quiz">
                  <Button className="flex h-11 w-full items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Create AI Quiz
                  </Button>
                </Link>
                <Link href="/quizzes">
                  <Button
                    variant="outline"
                    className="flex h-11 w-full items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Browse Public Quizzes
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="flex w-full items-center gap-2"
                  disabled
                >
                  <Plus className="h-4 w-4" />
                  Create Manual Quiz
                  <span className="text-muted-foreground ml-auto text-xs">
                    Soon
                  </span>
                </Button>
              </div>
            </div>

            <Button
              onClick={logout}
              variant="outline"
              className="flex w-full items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedRouteGuard>
  );
}
