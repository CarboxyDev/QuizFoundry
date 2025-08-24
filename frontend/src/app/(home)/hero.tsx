"use client";

import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { Safari } from "@/components/magicui/safari";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { fadeInUp, scaleIn, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import Link from "next/link";
export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">

      <motion.div
        className="relative mx-auto max-w-7xl text-center"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-6xl">
              <span className="mb-2 block">Generate Professional Quizzes</span>
              <AnimatedGradientText
                className="text-4xl font-extrabold drop-shadow-lg sm:text-5xl md:text-6xl lg:text-6xl"
                speed={0.8}
                colorFrom="#ff6b35"
                colorTo="#ff9f47"
              >
                in 15 Seconds with AI
              </AnimatedGradientText>
            </h1>
          </div>

          <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
            From topic to complete quiz in seconds. AI-powered generation with
            <span className="text-foreground font-semibold">
              {" "}
              advanced customization
            </span>
            ,
            <span className="text-foreground font-semibold">
              {" "}
              comprehensive analytics
            </span>
            , and
            <span className="text-foreground font-semibold">
              {" "}
              seamless sharing
            </span>
            .
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mb-12 flex flex-col gap-6 sm:flex-row sm:justify-center sm:gap-4"
        >
          {/* Primary CTA with ShimmerButton */}
          <Link href="/signup" className="group">
            <ShimmerButton
              className={cn(
                "h-16 px-10 text-lg font-bold text-white",
                "bg-primary hover:bg-primary/90",
                "hover:shadow-primary/25 shadow-2xl",
                "transform transition-all duration-300 hover:-translate-y-1 hover:scale-105",
                "rounded-full border-0",
              )}
              shimmerDuration="2s"
              shimmerColor="rgba(255,255,255,0.8)"
            >
              <span className="relative z-10 flex items-center">
                <Sparkles className="mr-2 h-5 w-5" />
                Try It Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </ShimmerButton>
          </Link>

          <Button
            variant="outline"
            size="lg"
            className={cn(
              "group relative h-16 overflow-hidden px-10 text-lg font-semibold backdrop-blur-sm",
              "bg-background/60 border-primary/30 hover:border-primary/60 border-2",
              "hover:bg-primary/10 hover:text-primary",
              "shadow-xl hover:shadow-2xl",
              "rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:scale-105",
              "before:from-primary/0 before:via-primary/5 before:to-primary/0 before:absolute before:inset-0 before:bg-gradient-to-r",
              "before:translate-x-[-100%] before:transition-transform before:duration-500 hover:before:translate-x-[100%]",
            )}
            onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
            aria-label="Scroll to How It Works section"
          >
            <span className="relative z-10 flex items-center">
              <Play className="group-hover:text-primary mr-3 h-5 w-5 transition-all duration-300 group-hover:scale-110" />
              See How It Works
            </span>
          </Button>
        </motion.div>

        <motion.div variants={scaleIn} className="flex justify-center">
          <div className="w-fit">
            <Safari url="quizfoundry.com/create" className="shadow-2xl" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
