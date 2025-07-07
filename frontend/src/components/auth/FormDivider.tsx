import React from "react";
import { cn } from "@/lib/utils";

interface FormDividerProps {
  children: React.ReactNode;
  className?: string;
}

export const FormDivider: React.FC<FormDividerProps> = ({
  children,
  className,
}) => (
  <div className={cn("relative py-3", className)}>
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="px-2 text-muted-foreground bg-card">{children}</span>
    </div>
  </div>
);

FormDivider.displayName = "FormDivider";
export default FormDivider;
