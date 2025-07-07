import { cn } from "@/lib/utils";
import React from "react";

interface AuthBackgroundPatternProps {
  className?: string;
}

const AuthBackgroundPattern: React.FC<AuthBackgroundPatternProps> = ({
  className,
}) => (
  <div
    className={cn(
      "absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.1),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.03),transparent_25%)]",
      className,
    )}
  />
);

export default AuthBackgroundPattern;
