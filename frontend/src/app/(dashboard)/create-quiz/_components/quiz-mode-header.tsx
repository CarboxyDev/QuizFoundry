"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Wand2, Zap } from "lucide-react";

interface QuizModeHeaderProps {
  mode: "express" | "advanced";
}

export function QuizModeHeader({ mode }: QuizModeHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="mb-8 text-center sm:mb-12"
    >
      <motion.div
        key={mode}
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.6,
        }}
        className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-500 ${
          mode === "express"
            ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 ring-1 ring-emerald-300/50 dark:from-emerald-900/30 dark:to-emerald-800/30 dark:text-emerald-300 dark:ring-emerald-500/30"
            : "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 ring-1 ring-purple-300/50 dark:from-purple-900/30 dark:to-purple-800/30 dark:text-purple-300 dark:ring-purple-500/30"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: 90, scale: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.4,
            }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: mode === "express" ? [0, 15, -15, 0] : [0, -15, 15, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
            >
              {mode === "express" ? (
                <Zap className="h-4 w-4" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="font-semibold"
            >
              {mode === "express" ? "Express Mode" : "Advanced Mode"}
            </motion.span>
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <h1 className="mb-4 text-2xl font-bold sm:text-3xl lg:text-4xl">
        Create Your Quiz
      </h1>
    </motion.div>
  );
}
