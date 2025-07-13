import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  BookOpen,
  FileText,
  Home,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const navigation = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Create Quiz", url: "/create-quiz", icon: Sparkles },
  { title: "Public Quizzes", url: "/public-quizzes", icon: BookOpen },
  { title: "My Quizzes", url: "/my-quizzes", icon: FileText },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface SidebarNavProps {
  pathname: string;
}

export function SidebarNav({ pathname }: SidebarNavProps) {
  const firstUrlToken = pathname.split("/")[1];

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navigation.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={firstUrlToken === item.url.split("/")[1]}
              tooltip={item.title}
            >
              <Link href={item.url} className="flex w-full items-center gap-3">
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium tracking-wide">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
