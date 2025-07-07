"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2, MoreHorizontal } from "lucide-react";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

interface ProgressLoaderProps extends LoaderProps {
  progress?: number;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const dotSizeClasses = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

export const SpinLoader = ({ className, size = "md", color }: LoaderProps) => {
  return (
    <motion.div
      className={cn("flex items-center justify-center", className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className={cn(sizeClasses[size], color || "text-primary")} />
    </motion.div>
  );
};

export const PulseLoader = ({ className, size = "md", color }: LoaderProps) => {
  return (
    <motion.div
      className={cn(
        "rounded-full",
        sizeClasses[size],
        color || "bg-primary",
        className,
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

export const BouncingDotsLoader = ({
  className,
  size = "md",
  color,
}: LoaderProps) => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 },
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            "rounded-full",
            dotSizeClasses[size],
            color || "bg-primary",
          )}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
};

export const ProgressLoader = ({
  className,
  size = "md",
  color,
  progress = 0,
}: ProgressLoaderProps) => {
  const heightClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div
      className={cn(
        "bg-muted w-full overflow-hidden rounded-full",
        heightClasses[size],
        className,
      )}
    >
      <motion.div
        className={cn("h-full rounded-full", color || "bg-primary")}
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
};

export const CircularLoader = ({
  className,
  size = "md",
  color,
  progress = 0,
}: ProgressLoaderProps) => {
  const sizeValues = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  const strokeWidthValues = {
    sm: 2,
    md: 3,
    lg: 4,
  };

  const circleSize = sizeValues[size];
  const strokeWidth = strokeWidthValues[size];
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative", className)}>
      <svg
        width={circleSize}
        height={circleSize}
        className="-rotate-90 transform"
      >
        {/* Background circle */}
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={color || "text-primary"}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            strokeDasharray,
          }}
        />
      </svg>
    </div>
  );
};

export const SkeletonLoader = ({ className }: { className?: string }) => {
  return (
    <motion.div
      className={cn("bg-muted rounded", className)}
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
};

export const TypingLoader = ({
  className,
  size = "md",
  color,
}: LoaderProps) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <MoreHorizontal
        className={cn(sizeClasses[size], color || "text-primary")}
      />
      <motion.div
        className="flex gap-1"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={cn(
              "rounded-full",
              dotSizeClasses[size],
              color || "bg-primary",
            )}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export const WaveLoader = ({ className, size = "md", color }: LoaderProps) => {
  const barHeights = {
    sm: ["h-2", "h-4", "h-3", "h-5", "h-2"],
    md: ["h-3", "h-6", "h-4", "h-7", "h-3"],
    lg: ["h-4", "h-8", "h-5", "h-9", "h-4"],
  };

  return (
    <div className={cn("flex items-end gap-1", className)}>
      {barHeights[size].map((height, index) => (
        <motion.div
          key={index}
          className={cn("w-1 rounded-full", height, color || "bg-primary")}
          animate={{
            scaleY: [1, 0.3, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
};

export const LoaderWithText = ({
  text = "Loading...",
  className,
  loaderType = "spin",
  size = "md",
}: LoaderProps & {
  text?: string;
  loaderType?: "spin" | "pulse" | "dots" | "wave";
}) => {
  const renderLoader = () => {
    switch (loaderType) {
      case "pulse":
        return <PulseLoader size={size} />;
      case "dots":
        return <BouncingDotsLoader size={size} />;
      case "wave":
        return <WaveLoader size={size} />;
      default:
        return <SpinLoader size={size} />;
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {renderLoader()}
      <motion.p
        className="text-muted-foreground text-sm"
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  );
};
