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
          className="grid gap-4 md:grid-cols-3"
        >
          <motion.div
            variants={stepVariants}
            className="flex items-start gap-3"
          >
            <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md">
              1
            </div>
            <div>
              <h4 className="font-medium">Create a Quiz</h4>
              <p className="text-muted-foreground text-sm">
                Start by creating your first AI-powered quiz on any topic.
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
              <h4 className="font-medium">Share & Play</h4>
              <p className="text-muted-foreground text-sm">
                Share your quiz with others or explore community quizzes.
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
              <h4 className="font-medium">Track Progress</h4>
              <p className="text-muted-foreground text-sm">
                View quiz performance and see detailed analytics.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
