import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock } from "lucide-react";
import React, { useState } from "react";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  id = "password",
  placeholder = "Enter your password",
  required = false,
  error,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1">
      <div className="relative">
        <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
        <Input
          id={id}
          placeholder={placeholder}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={cn("pr-10 pl-10", className)}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
