"use client";

import { Card, CardContent } from "@/components/ui/card";
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
          <h2 className="mb-4 text-4xl font-bold tracking-tight">
            Everything You Need for the Complete Quiz Experience
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            From AI-powered quiz generation to detailed performance analytics,
            we&apos;ve got every aspect of quiz creation and participation
            covered.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="group"
            >
              <Card className="bg-card/60 hover:bg-card/80 h-full backdrop-blur-sm transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className={cn("rounded-lg p-2", feature.bg)}>
                      <feature.icon className={cn("h-6 w-6", feature.color)} />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
});

FeaturesSection.displayName = "FeaturesSection";
