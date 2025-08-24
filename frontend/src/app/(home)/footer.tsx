import Image from "next/image";
import { memo } from "react";

export const Footer = memo(() => {
  return (
    <footer className="bg-card/30 border-t px-4 py-12 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="QuizFoundry" width={40} height={40} />
            <span className="text-primary text-lg font-semibold">
              QuizFoundry
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2025 QuizFoundry. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
