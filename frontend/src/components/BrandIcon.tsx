import { cn } from "@/lib/utils";
import Image from "next/image";

interface BrandIconProps {
  size?: number;
  className?: string;
}

export const BrandIcon = ({ size = 40, className }: BrandIconProps) => {
  return (
    <Image
      src="/logo.png"
      alt="QuizFoundry"
      width={size}
      height={size}
      className={cn("mx-auto", className)}
    />
  );
};
