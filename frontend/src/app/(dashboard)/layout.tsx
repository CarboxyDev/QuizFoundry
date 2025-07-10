"use client";

import DashboardHeader from "@/app/dashboard/DashboardHeader";
import { SidebarNav } from "@/app/dashboard/SidebarNav";
import { SidebarUserFooter } from "@/app/dashboard/SidebarUserFooter";
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
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRouteGuard>
  );
}
