import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export function GettingStarted() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="text-primary h-5 w-5" />
          Getting Started
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <motion.div
            variants={stepVariants}
            className="flex items-start gap-3"
          >
            <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md">
              1
            </div>
            <div>
              <h4 className="font-medium">Explore Your Dashboard</h4>
              <p className="text-muted-foreground text-sm">
                Familiarize yourself with your dashboard, My Quizzes, and
                analytics sections.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={stepVariants}
            className="flex items-start gap-3"
          >
            <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md">
              2
            </div>
            <div>
              <h4 className="font-medium">Choose Creation Mode</h4>
              <p className="text-muted-foreground text-sm">
                Pick Express for speed, Advanced for customization, or Manual
                for full control.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={stepVariants}
            className="flex items-start gap-3"
          >
            <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md">
              3
            </div>
            <div>
              <h4 className="font-medium">Configure Settings</h4>
              <p className="text-muted-foreground text-sm">
                Set your topic, difficulty level, question count, and visibility
                preferences.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={stepVariants}
            className="flex items-start gap-3"
          >
            <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md">
              4
            </div>
            <div>
              <h4 className="font-medium">Generate with AI</h4>
              <p className="text-muted-foreground text-sm">
                Let AI instantly create comprehensive quizzes tailored to your
                specifications.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={stepVariants}
            className="flex items-start gap-3"
          >
            <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md">
              5
            </div>
            <div>
              <h4 className="font-medium">Share & Manage</h4>
              <p className="text-muted-foreground text-sm">
                Access your quizzes in My Quizzes, share them publicly, or
                explore community quizzes.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={stepVariants}
            className="flex items-start gap-3"
          >
            <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md">
              6
            </div>
            <div>
              <h4 className="font-medium">Track Performance</h4>
              <p className="text-muted-foreground text-sm">
                View detailed analytics on quiz performance and track personal
                progress insights.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
