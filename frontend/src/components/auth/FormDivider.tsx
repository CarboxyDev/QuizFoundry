import { cn } from "@/lib/utils";
import React from "react";

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
      <span className="text-muted-foreground bg-card px-2">{children}</span>
    </div>
  </div>
);

FormDivider.displayName = "FormDivider";
export default FormDivider;
