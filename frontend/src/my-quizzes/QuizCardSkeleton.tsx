"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

export default function QuizCardSkeleton() {
  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
    >
      <Card className="border-border/50 bg-card/50 flex h-full flex-col overflow-hidden backdrop-blur-sm">
        <CardHeader className="space-y-2 pb-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-5/6" />
        </CardHeader>
        <CardContent className="flex flex-grow flex-col space-y-4 pt-0">
          <Skeleton className="h-4 w-1/2" />
          <div className="grid w-full grid-cols-2 gap-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="mt-auto grid w-full grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
