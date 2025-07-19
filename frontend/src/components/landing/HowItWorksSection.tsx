"use client";

import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Step } from "@/types/landing";
import { motion } from "framer-motion";
import { Brain, Globe, Settings2, TrendingUp, Zap } from "lucide-react";
import { memo } from "react";

const steps: Step[] = [
  {
    step: "1",
    title: "Choose Mode",
    description: "Pick Express for speed or Advanced for customization",
    icon: Zap,
  },
  {
    step: "2",
    title: "Configure Settings",
    description: "Set topic, visibility, and advanced options if needed",
    icon: Settings2,
  },
  {
    step: "3",
    title: "Generate Quiz",
    description: "AI instantly creates a quiz for you with your settings",
    icon: Brain,
  },
  {
    step: "4",
    title: "Manage & Share",
    description: "Access via My Quizzes, share links, or edit anytime",
    icon: Globe,
  },
  {
    step: "5",
    title: "Track Performance",
    description: "View creator analytics and personal progress insights",
    icon: TrendingUp,
  },
];

export const HowItWorksSection = memo(() => {
  return (
    <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto max-w-7xl"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight">
            How It Works
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            From idea to insight in just a few simple steps. Create, take, and
            analyze your quizzes and attempts with comprehensive performance
            tracking.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              variants={fadeInUp}
              className="relative text-center sm:text-left lg:text-left"
            >
              <div className="mb-4 flex justify-center sm:justify-start lg:justify-start">
                <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
                  <step.icon className="h-8 w-8" />
                </div>
              </div>
              <div className="text-primary mb-2 text-sm font-medium">
                Step {step.step}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < 4 && (
                <div className="from-primary/20 absolute top-8 -right-4 hidden h-0.5 w-8 bg-gradient-to-r to-transparent md:hidden lg:block xl:block" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
});

HowItWorksSection.displayName = "HowItWorksSection";
