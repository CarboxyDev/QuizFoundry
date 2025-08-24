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
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="from-primary bg-gradient-to-r to-orange-500 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
            From idea to insight in just a few simple steps.{" "}
            <span className="text-foreground font-semibold">
              Create, take, and analyze
            </span>{" "}
            your quizzes and attempts with
            <span className="text-foreground font-semibold">
              {" "}
              comprehensive performance tracking
            </span>
            .
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              variants={fadeInUp}
              className="group relative text-center sm:text-left lg:text-left"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6 flex justify-center sm:justify-start lg:justify-start">
                <motion.div
                  className="text-primary flex h-20 w-20 items-center justify-center rounded-full border border-zinc-800/60 bg-zinc-900/70 shadow-lg transition-all duration-200 group-hover:shadow-xl"
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <step.icon className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
                </motion.div>
              </div>
              <div className="from-primary mb-3 bg-gradient-to-r to-orange-500 bg-clip-text text-sm font-bold tracking-wide text-transparent uppercase">
                Step {step.step}
              </div>
              <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              {index < 4 && (
                <div className="from-primary/30 absolute top-10 -right-4 hidden h-0.5 w-8 bg-gradient-to-r to-orange-500/30 md:hidden lg:block xl:block" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
});

HowItWorksSection.displayName = "HowItWorksSection";
