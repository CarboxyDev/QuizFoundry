import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BarChart3, BookOpen, FileText, Home, Sparkles } from "lucide-react";
import Link from "next/link";

const navigation = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Create Quiz", url: "/create-quiz", icon: Sparkles },
  { title: "View Quizzes", url: "/quizzes", icon: BookOpen },
  { title: "My Quizzes", url: "/my-quizzes", icon: FileText },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

interface SidebarNavProps {
  pathname: string;
}

export function SidebarNav({ pathname }: SidebarNavProps) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {navigation.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.url}
              tooltip={item.title}
            >
              <Link href={item.url}>
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
