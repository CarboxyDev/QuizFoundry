"use client";

import { cn } from "@/lib/utils";
import React, { ComponentPropsWithoutRef } from "react";

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerDuration?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "rgba(255,255,255,0.6)",
      shimmerDuration = "2s",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          "group relative overflow-hidden",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Shimmer effect overlay */}
        <div 
          className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            animationDuration: shimmerDuration,
          }}
        />
        {children}
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";