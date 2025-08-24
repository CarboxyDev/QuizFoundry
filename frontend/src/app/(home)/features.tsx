"use client";

import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Feature } from "@/types/landing";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Bot, Brain, Target, Wand2 } from "lucide-react";
import { memo } from "react";

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI-Powered Generation",
    description:
      "Create comprehensive quizzes instantly with an AI that understands context and difficulty.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: BookOpen,
    title: "Public Quiz Library",
    description:
      "Access diverse quizzes created by the community, or share your own publicly for others to discover and take.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: BarChart3,
    title: "Comprehensive Analytics",
    description:
      "Track performance, identify patterns, and gain deep insights with detailed analytics for creators and quiz-takers.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Wand2,
    title: "Full Customization Control",
    description:
      "Generate AI prototypes then fine-tune every question, answer, and setting with advanced editing tools.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Target,
    title: "Privacy & Sharing Options",
    description:
      "Choose between public sharing for community engagement or private quizzes for personal use and testing.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Bot,
    title: "Quality Assurance",
    description:
      "Advanced AI validation ensures high-quality public content with automated spam prevention and content moderation.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

export const FeaturesSection = memo(() => {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto max-w-7xl"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Everything You Need for the
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Complete Quiz Experience
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
            From AI-powered quiz generation to detailed performance analytics,
            we&apos;ve got every aspect of quiz creation and participation
            <span className="text-foreground font-semibold"> perfectly covered</span>.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="group"
            >
              <div className="group/card relative h-full">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/20 opacity-0 group-hover/card:opacity-100 blur-xl transition-all duration-500" />
                <div className="relative h-full rounded-2xl bg-zinc-900/60 border border-zinc-800/60 hover:border-primary/40 shadow-lg hover:shadow-xl transition-all duration-200 p-8 flex flex-col">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-orange-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="mb-6">
                      <div className={cn("mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg group-hover/card:shadow-xl transition-all duration-300 group-hover/card:scale-110", feature.bg)}>
                        <feature.icon className={cn("h-8 w-8 transition-all duration-300", feature.color)} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground transition-colors duration-300">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed transition-colors duration-300">{feature.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
});

FeaturesSection.displayName = "FeaturesSection";
