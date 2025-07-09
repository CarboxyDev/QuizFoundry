import { Button } from "@/components/ui/button";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { capitalize } from "@/lib/string";
import { LogOut, User } from "lucide-react";

interface UserProfile {
  name: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
  is_onboarding_complete: boolean;
}

interface SidebarUserFooterProps {
  user: UserProfile | null;
  logout: () => void;
}

export function SidebarUserFooter({ user, logout }: SidebarUserFooterProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="bg-accent flex h-8 w-8 items-center justify-center rounded-full">
            <User className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.name || "User"}</span>
            <span className="text-muted-foreground truncate text-xs">
              {capitalize(user?.role || "Member")}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-8 w-8 p-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
