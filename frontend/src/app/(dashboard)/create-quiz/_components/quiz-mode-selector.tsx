"use client";

import { motion } from "framer-motion";
import { Sparkles, Wand2, Zap } from "lucide-react";

interface QuizModeSelectorProps {
  mode: "express" | "advanced";
  onModeChange: (mode: "express" | "advanced") => void;
}

export function QuizModeSelector({
  mode,
  onModeChange,
}: QuizModeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <div
            className={`relative cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 sm:p-6 ${
              mode === "express"
                ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg ring-1 ring-emerald-200 dark:border-emerald-500 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:ring-emerald-500/20"
                : "border-border bg-card hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
            }`}
            onClick={() => onModeChange("express")}
          >
            {mode === "express" && (
              <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-emerald-500 p-1">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${
                  mode === "express"
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                }`}
              >
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3
                  className={`text-base font-semibold sm:text-lg ${
                    mode === "express"
                      ? "text-emerald-900 dark:text-emerald-100"
                      : "text-foreground"
                  }`}
                >
                  Express Mode
                </h3>
                <p
                  className={`text-sm ${
                    mode === "express"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-muted-foreground"
                  }`}
                >
                  Creates final quiz instantly
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <div
            className={`relative cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 sm:p-6 ${
              mode === "advanced"
                ? "border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg ring-1 ring-purple-200 dark:border-purple-500 dark:from-purple-900/20 dark:to-purple-800/20 dark:ring-purple-500/20"
                : "border-border bg-card hover:border-purple-200 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
            }`}
            onClick={() => onModeChange("advanced")}
          >
            {mode === "advanced" && (
              <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-purple-500 p-1">
                <Wand2 className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${
                  mode === "advanced"
                    ? "bg-purple-500 text-white"
                    : "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
                }`}
              >
                <Wand2 className="h-6 w-6" />
              </div>
              <div>
                <h3
                  className={`text-base font-semibold sm:text-lg ${
                    mode === "advanced"
                      ? "text-purple-900 dark:text-purple-100"
                      : "text-foreground"
                  }`}
                >
                  Advanced Mode
                </h3>
                <p
                  className={`text-sm ${
                    mode === "advanced"
                      ? "text-purple-700 dark:text-purple-300"
                      : "text-muted-foreground"
                  }`}
                >
                  Creates AI prototype for editing
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
