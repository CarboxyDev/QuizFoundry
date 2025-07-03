"use client";

import { ProtectedRouteGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Plus, Sparkles, Users } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.1),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.03),transparent_25%)]" />

        <Card className="w-full max-w-md relative z-10 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || "there"}!
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                You have successfully completed onboarding.
              </p>
              {user?.role && (
                <p className="text-xs text-muted-foreground">
                  Role: {user.role}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-center">Quick Actions</h3>
              <div className="grid gap-3">
                <Link href="/create-quiz">
                  <Button className="w-full flex items-center gap-2 h-11">
                    <Sparkles className="w-4 h-4" />
                    Create AI Quiz
                  </Button>
                </Link>
                <Link href="/quizzes">
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 h-11"
                  >
                    <Users className="w-4 h-4" />
                    Browse Public Quizzes
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  disabled
                >
                  <Plus className="w-4 h-4" />
                  Create Manual Quiz
                  <span className="ml-auto text-xs text-muted-foreground">
                    Soon
                  </span>
                </Button>
              </div>
            </div>

            <Button
              onClick={logout}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedRouteGuard>
  );
}
