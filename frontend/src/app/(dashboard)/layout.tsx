"use client";

import { SidebarNav } from "@/app/(dashboard)/dashboard/SidebarNav";
import { SidebarUserFooter } from "@/app/(dashboard)/dashboard/SidebarUserFooter";
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
import Image from "next/image";
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
              <Image src="/logo.png" alt="QuizFoundry" width={40} height={40} />
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
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ProtectedRouteGuard>
  );
}
