"use client";

import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { motion } from "framer-motion";
import { Check, Wand2, Zap } from "lucide-react";
import { memo } from "react";

const expressFeatures = [
  "AI generates a complete quiz instantly",
  "Start with recommended defaults you can adjust",
  "Customize question count and difficulty level",
  "One-click creation",
  "Edit quiz anytime after creation",
];

const advancedFeatures = [
  "Customize question count, difficulty & options",
  "Optional manual editing before publishing",
  "AI-generated prototype for fine-tuning",
  "Full editing interface with draft support",
  "Perfect for detailed, curated quizzes",
];

export const QuizModesSection = memo(() => {
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
            Choose Your Perfect Mode
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Two powerful creation modes designed for different needs. From
            lightning-fast generation to detailed customization.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:h-[600px] lg:grid-cols-12 lg:grid-rows-8">
          <motion.div
            variants={fadeInUp}
            className="group mb-6 lg:col-span-7 lg:row-span-8 lg:mb-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-card/60 hover:bg-card/80 h-full backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
              <CardContent className="flex h-full flex-col p-8">
                <div className="mb-6">
                  <div className="mb-4 flex items-center gap-3">
                    <motion.div
                      className="rounded-xl bg-blue-500/10 p-3"
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Zap className="h-8 w-8 text-blue-500" />
                    </motion.div>
                    <h3 className="mb-3 text-3xl font-bold">Express Mode</h3>
                  </div>

                  <p className="text-muted-foreground text-lg">
                    Lightning fast AI generation for instant quiz creation
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  {expressFeatures.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                <motion.div
                  className="mt-8 border-t pt-6"
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center">
                    <motion.div
                      className="text-3xl font-bold text-blue-500"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      ~15 seconds
                    </motion.div>
                    <div className="text-muted-foreground text-sm">
                      Average creation time
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="group lg:col-span-5 lg:row-span-8"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-card/60 hover:bg-card/80 h-full backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-6">
                  <div className="mb-4 flex items-center gap-3">
                    <motion.div
                      className="rounded-lg bg-purple-500/10 p-3"
                      whileHover={{ rotate: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Wand2 className="h-8 w-8 text-purple-500" />
                    </motion.div>
                    <h3 className="text-3xl font-bold">Advanced Mode</h3>
                  </div>
                  <p className="text-muted-foreground text-lg">
                    Full control with AI power and customization
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  {advancedFeatures.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
});

QuizModesSection.displayName = "QuizModesSection";
