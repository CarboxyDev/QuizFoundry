import * as React from "react";
import { useFormSubmission } from "@/hooks/useFormSubmission";
import { cn } from "@/lib/utils";

interface FormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  onSubmit: () => void | Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * Enhanced Form component that provides ENTER key submission by default
 * Use this instead of the native <form> element for consistent submission behavior
 */
export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ onSubmit, disabled, className, children, ...props }, ref) => {
    const { handleSubmit } = useFormSubmission({ onSubmit, disabled });

    return (
      <form
        {...props}
        ref={ref}
        onSubmit={handleSubmit}
        className={cn("space-y-4", className)}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = "Form";
