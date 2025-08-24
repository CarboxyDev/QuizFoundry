"use client";

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
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Choose Your
            </span>{" "}
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Perfect Mode
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
            Two powerful creation modes designed for different needs. From
            <span className="text-foreground font-semibold"> lightning-fast generation</span> to
            <span className="text-foreground font-semibold"> detailed customization</span>.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            variants={fadeInUp}
            className="group relative"
          >
            <div className="group/express relative h-full">
              <div className="relative h-full rounded-3xl border border-zinc-800/60 bg-zinc-900/70 shadow-lg hover:shadow-xl transition-all duration-300 p-8 flex flex-col min-h-[500px]">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-orange-500/5 to-transparent opacity-0 group-hover/express:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 mb-8">
                  <div className="mb-6 flex items-center gap-4">
                    <motion.div
                      className="rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/20 p-4 shadow-lg group-hover/express:shadow-xl transition-all duration-300"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Zap className="h-10 w-10 text-primary" />
                    </motion.div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Express Mode</h3>
                  </div>

                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Lightning fast AI generation for 
                    <span className="text-foreground font-semibold"> instant quiz creation</span>
                  </p>
                </div>

                <div className="relative z-10 flex-1 space-y-4 mb-8">
                  {expressFeatures.map((feature, index) => (
                    <motion.div 
                      key={feature} 
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="rounded-full bg-green-500/20 p-1.5 shrink-0">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-muted-foreground leading-relaxed">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="relative z-10 border-t border-zinc-800/60 pt-6 text-center"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="text-4xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    ~15 seconds
                  </motion.div>
                  <div className="text-muted-foreground text-sm font-medium mt-2">
                    Average creation time
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="group relative"
          >
            <div className="group/advanced relative h-full">
              <div className="relative h-full rounded-3xl border border-zinc-800/60 bg-zinc-900/70 shadow-lg hover:shadow-xl transition-all duration-300 p-8 flex flex-col min-h-[500px]">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent opacity-0 group-hover/advanced:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 mb-8">
                  <div className="mb-6 flex items-center gap-4">
                    <motion.div
                      className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 shadow-lg group-hover/advanced:shadow-xl transition-all duration-300"
                      whileHover={{ rotate: -5, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Wand2 className="h-10 w-10 text-purple-500" />
                    </motion.div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Advanced Mode</h3>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Full control with 
                    <span className="text-foreground font-semibold"> AI power and customization</span>
                  </p>
                </div>

                <div className="relative z-10 flex-1 space-y-4 mb-8">
                  {advancedFeatures.map((feature, index) => (
                    <motion.div 
                      key={feature} 
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="rounded-full bg-green-500/20 p-1.5 shrink-0">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-muted-foreground leading-relaxed">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
});

QuizModesSection.displayName = "QuizModesSection";
