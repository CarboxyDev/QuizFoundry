import { cn } from "@/lib/utils";

interface DifficultyIconProps {
  difficulty: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const DifficultyIcon = ({
  difficulty,
  size = "md",
  className,
}: DifficultyIconProps) => {
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return {
          gradient: "bg-gradient-to-br from-green-400 to-green-600",
          shadow: "shadow-green-500/30",
          label: "Easy",
        };
      case "medium":
        return {
          gradient: "bg-gradient-to-br from-yellow-400 to-orange-500",
          shadow: "shadow-yellow-500/30",
          label: "Medium",
        };
      case "hard":
        return {
          gradient: "bg-gradient-to-br from-red-400 to-red-600",
          shadow: "shadow-red-500/30",
          label: "Hard",
        };
      default:
        return {
          gradient: "bg-gradient-to-br from-gray-400 to-gray-500",
          shadow: "shadow-gray-500/20",
          label: "Unknown",
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return "h-3 w-3";
      case "lg":
        return "h-5 w-5";
      default:
        return "h-4 w-4";
    }
  };

  const config = getDifficultyConfig(difficulty);
  const sizeClasses = getSizeClasses(size);

  return (
    <div
      className={cn(
        "rounded-full shadow-sm transition-all duration-200 hover:shadow-md",
        config.gradient,
        config.shadow,
        sizeClasses,
        className,
      )}
      title={`${config.label} Difficulty`}
    />
  );
};
