"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, scaleIn, gradientAnimation } from "@/lib/animations";
import { motion } from "framer-motion";
import { ArrowRight, Play, Brain } from "lucide-react";
import Link from "next/link";

export const HeroSection = memo(() => {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="from-primary/3 via-primary/1 absolute inset-0 bg-gradient-to-b to-transparent" />
      <div className="via-primary/2 absolute inset-0 bg-gradient-to-r from-transparent to-transparent" />
      <motion.div
        className="relative mx-auto max-w-7xl text-center"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Generate Professional Quizzes
            <br />
            <motion.span
              className="from-primary via-primary/80 to-primary/60 bg-gradient-to-r bg-[length:200%_100%] bg-clip-text text-transparent"
              animate={gradientAnimation.animate}
              transition={gradientAnimation.transition}
              style={{
                textShadow: "0 0 30px hsl(var(--primary) / 0.4)",
              }}
            >
              in 15 Seconds with AI
            </motion.span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg sm:text-xl md:text-2xl">
            From topic to complete quiz in seconds. AI-powered generation with
            advanced customization, comprehensive analytics, and seamless
            sharing. Perfect for educators, trainers, and quiz enthusiasts.
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center"
        >
          <Link href="/signup">
            <Button
              size="lg"
              className={cn(
                "group relative h-14 px-8 text-lg font-semibold",
                "bg-primary hover:bg-primary/90",
                "hover:shadow-primary/25 shadow-lg hover:shadow-xl",
                "transform transition-all duration-200 hover:-translate-y-0.5",
                "border-0",
              )}
            >
              <span className="flex items-center">
                Try It Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "group relative h-14 px-8 text-lg font-semibold backdrop-blur-sm",
              "bg-background/80 border-primary/20 hover:border-primary/40 border-2",
              "hover:bg-primary/5",
              "shadow-lg hover:shadow-xl",
            )}
            onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
            aria-label="Scroll to How It Works section"
          >
            <span className="flex items-center">
              <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              See How It Works
            </span>
          </Button>
        </motion.div>

        <motion.div variants={scaleIn} className="relative mx-auto max-w-4xl">
          <div className="bg-card/60 relative rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
            <div className="border-muted-foreground/20 bg-muted/30 flex aspect-video w-full items-center justify-center rounded-xl border-2 border-dashed">
              <div className="text-center">
                <div className="bg-muted-foreground/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Brain className="text-muted-foreground/60 h-8 w-8" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                  Demo Image Placeholder
                </p>
                <p className="text-muted-foreground/60 text-xs">
                  Show QuizFoundry in action
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";