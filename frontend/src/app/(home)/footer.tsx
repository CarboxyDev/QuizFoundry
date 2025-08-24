import Image from "next/image";
import { memo } from "react";

export const Footer = memo(() => {
  return (
    <footer className="relative overflow-hidden bg-card/60 border-t border-primary/20 px-4 py-16 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-primary/20 to-orange-500/20 p-2 shadow-lg">
              <Image src="/logo.png" alt="QuizFoundry" width={40} height={40} className="rounded-full" />
            </div>
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-xl font-bold text-transparent">
              QuizFoundry
            </span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            © 2025 QuizFoundry. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
