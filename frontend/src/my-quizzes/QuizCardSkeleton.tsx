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
      <Card className="border-border/50 bg-card/80 relative flex h-full flex-col overflow-hidden backdrop-blur-sm">
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="flex h-[3rem] items-start justify-between gap-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <div className="flex h-[2.5rem] items-start">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-grow flex-col pt-0">
          {/* Visibility Icon and AI Badge Row */}
          <div className="mb-2 flex min-h-[24px] items-center justify-between">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          
          {/* Stats Row */}
          <div className="mb-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3.5 w-3.5 rounded" />
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-3.5 w-3.5 rounded" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-3.5 w-3.5 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-auto grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full rounded" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
