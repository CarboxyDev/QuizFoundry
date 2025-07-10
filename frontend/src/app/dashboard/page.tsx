"use client";

import DashboardHeader from "@/app/dashboard/DashboardHeader";
import { ProtectedRouteGuard } from "@/components/AuthGuard";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth/useAuth";
import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { DashboardCards } from "./DashboardCards";
import { GettingStarted } from "./GettingStarted";
import { SidebarNav } from "./SidebarNav";
import { SidebarUserFooter } from "./SidebarUserFooter";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <ProtectedRouteGuard>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="border-sidebar-border">
            <div className="flex h-12 items-center gap-2 px-4">
              <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">QuizFoundry</span>
                <span className="text-muted-foreground truncate text-xs">
                  AI Powered Quizzes
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav pathname={pathname} />
          </SidebarContent>
          <SidebarFooter className="border-sidebar-border border-t">
            <SidebarUserFooter user={user} logout={logout} />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
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
                <DashboardCards />
                <div className="mt-8">
                  <GettingStarted />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRouteGuard>
  );
}
