import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import React from "react";

interface AuthSparklesIconProps {
  className?: string;
}

const AuthSparklesIcon: React.FC<AuthSparklesIconProps> = ({ className }) => (
  <div
    className={cn(
      "from-primary/20 to-primary/10 border-primary/20 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-gradient-to-br",
      className,
    )}
  >
    <Sparkles className="text-primary h-8 w-8" />
  </div>
);

export default AuthSparklesIcon;
