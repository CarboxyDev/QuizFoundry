"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Wand2, Zap } from "lucide-react";

interface QuizSuccessModalProps {
  showSuccess: boolean;
  mode: "express" | "advanced";
}

export function QuizSuccessModal({ showSuccess, mode }: QuizSuccessModalProps) {
  return (
    <AnimatePresence>
      {showSuccess && (
        <motion.div
          key="successOverlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
            className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent"
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 15,
                delay: 0.3,
              }}
              className="relative mb-6"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-primary/10 ring-primary/20 flex items-center justify-center rounded-full p-6 ring-1"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {mode === "express" ? (
                    <Zap className="text-primary h-16 w-16" />
                  ) : (
                    <Wand2 className="text-primary h-16 w-16" />
                  )}
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <h2 className="text-foreground text-4xl font-bold">
                {mode === "express"
                  ? "Quiz Created Successfully!"
                  : "Prototype Quiz Created Successfully!"}
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-muted-foreground text-lg font-medium"
              >
                {mode === "express"
                  ? "Your quiz is ready to share and take"
                  : "Your quiz is ready to edit and customize"}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-muted-foreground mt-4 flex items-center justify-center gap-2 text-sm"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Loader2 className="h-4 w-4" />
                </motion.div>
                {mode === "express"
                  ? "Redirecting to your quizzes..."
                  : "Redirecting to the quiz editor..."}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
