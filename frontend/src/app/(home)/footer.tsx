"use client";

import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { fadeInUp } from "@/lib/animations";
import { motion } from "framer-motion";
import Image from "next/image";
import { memo } from "react";

export const Footer = memo(() => {
  return (
    <footer className="bg-background/30 relative overflow-hidden backdrop-blur-sm">
      <div className="via-primary/30 absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent" />
      <div className="from-primary/5 absolute top-0 right-0 left-0 h-20 bg-gradient-to-b via-orange-500/3 to-transparent" />

      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          className="relative z-10 mx-auto max-w-7xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <motion.div className="flex items-center gap-3" variants={fadeInUp}>
              <div className="relative">
                <div className="from-primary/20 absolute inset-0 animate-pulse rounded-full bg-gradient-to-br to-orange-500/20 blur-sm" />
                <div className="from-primary/20 border-primary/20 relative rounded-full border bg-gradient-to-br to-orange-500/20 p-2 shadow-xl">
                  <Image
                    src="/logo.png"
                    alt="QuizFoundry"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
              </div>
              <AnimatedGradientText
                className="text-xl font-bold"
                speed={0.8}
                colorFrom="#ff6b35"
                colorTo="#ff9f47"
              >
                QuizFoundry
              </AnimatedGradientText>
            </motion.div>

            <motion.p
              className="text-muted-foreground/70 text-sm font-medium"
              variants={fadeInUp}
            >
              © 2025 CarboxyDev. All rights reserved.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
