import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import React from "react";

interface AuthSparklesIconProps {
  className?: string;
}

const AuthSparklesIcon: React.FC<AuthSparklesIconProps> = ({ className }) => (
  <div
    className={cn(
      "from-primary/20 to-primary/10 border-primary/20 group relative mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border bg-gradient-to-br",
      "before:from-primary/10 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:to-transparent before:opacity-0 before:transition-opacity before:duration-1000",
      "animate-pulse-soft shadow-lg",
      "hover:shadow-primary/20 transition-all duration-300 hover:shadow-xl",
      className,
    )}
    style={{
      animation: "pulse-glow 3s ease-in-out infinite alternate",
    }}
  >
    <div className="from-primary/5 absolute inset-0 rounded-2xl bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    <Sparkles
      className="text-primary relative z-10 h-8 w-8 transition-transform duration-1000"
      style={{
        animation: "gentle-rotate 8s linear infinite",
      }}
    />
    <style jsx>{`
      @keyframes pulse-glow {
        0% {
          box-shadow: 0 0 15px rgba(var(--primary-rgb, 59, 130, 246), 0.05);
        }
        100% {
          box-shadow: 0 0 20px rgba(var(--primary-rgb, 59, 130, 246), 0.08);
        }
      }

      @keyframes gentle-rotate {
        0% {
          transform: rotate(0deg);
        }
        25% {
          transform: rotate(2deg);
        }
        50% {
          transform: rotate(0deg);
        }
        75% {
          transform: rotate(-2deg);
        }
        100% {
          transform: rotate(0deg);
        }
      }

      .animate-pulse-soft {
        animation: pulse-soft 2s ease-in-out infinite alternate;
      }

      @keyframes pulse-soft {
        0% {
          transform: scale(1);
        }
        100% {
          transform: scale(1.02);
        }
      }
    `}</style>
  </div>
);

export default AuthSparklesIcon;
