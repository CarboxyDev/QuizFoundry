import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { capitalize } from "@/lib/string";
import { LogOut, Settings, User } from "lucide-react";

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="hover:bg-accent h-auto w-full justify-start p-2"
            >
              <div className="flex items-center gap-2">
                <div className="bg-accent flex h-8 w-8 items-center justify-center rounded-full">
                  <User className="h-4 w-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.name || "User"}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {capitalize(user?.role || "Member")}
                  </span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} variant="destructive">
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
