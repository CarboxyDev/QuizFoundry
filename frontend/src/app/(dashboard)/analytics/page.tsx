"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOverviewAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  ChevronRight,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const headerVariants = {
  initial: { opacity: 0, y: -30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4 },
  },
};

function AnalyticsCard({
  title,
  description,
  href,
  icon: Icon,
  color,
  features,
}: {
  title: string;
  description: string;
  href: string;
  icon: any;
  color: "blue" | "green";
  features: string[];
}) {
  const colorClasses = {
    blue: {
      iconBg: "bg-blue-500/20 text-blue-500",
      dotBg: "bg-blue-500/20",
      dot: "bg-blue-500",
      buttonHover: "hover:bg-blue-50",
    },
    green: {
      iconBg: "bg-green-500/20 text-green-500",
      dotBg: "bg-green-500/20",
      dot: "bg-green-500",
      buttonHover: "hover:bg-green-50",
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={href}>
        <Card className="group hover:border-primary/30 relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className={cn("rounded-xl p-3", colors.iconBg)}>
                <Icon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold">{title}</CardTitle>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
              <div className="rounded-full p-2 transition-transform group-hover:scale-110">
                <ChevronRight className="text-muted-foreground h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    colors.dotBg,
                  )}
                >
                  <div className={cn("h-2 w-2 rounded-full", colors.dot)} />
                </div>
                <span className="text-sm">{feature}</span>
              </motion.div>
            ))}

            <div className="pt-4">
              <Button
                variant="outline"
                className={cn(
                  "group-hover:border-primary/50 w-full justify-between transition-colors",
                  colors.buttonHover,
                )}
              >
                Explore Analytics
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function QuickStatsCard({
  title,
  value,
  icon: Icon,
  color,
  change,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  change?: string;
  isLoading?: boolean;
}) {
  return (
    <motion.div variants={cardVariants}>
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn("rounded-lg p-2", color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-sm">{title}</p>
              <div className="flex items-baseline gap-2">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 rounded-md" />
                ) : (
                  <p className="text-2xl font-bold">{value}</p>
                )}
                {change && !isLoading && (
                  <span className="text-xs font-medium text-emerald-500">
                    {change}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { data: overviewData, isLoading, error } = useOverviewAnalytics();

  return (
    <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
      <motion.div
        className="from-background via-muted/30 to-muted/50 min-h-screen flex-1 bg-gradient-to-br"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <motion.div
            className="mb-8"
            variants={headerVariants}
            initial="initial"
            animate="animate"
          >
            <div className="mb-6">
              <h1 className="mb-2 text-4xl font-bold tracking-tight">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Comprehensive insights into your own quiz creations and
                participation.
              </p>
            </div>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {error ? (
                <div className="col-span-4 text-center text-red-500">
                  Error loading analytics data
                </div>
              ) : (
                <>
                  <QuickStatsCard
                    title="Quizzes Created"
                    value={overviewData?.quizzesCreated || 0}
                    icon={Brain}
                    color="bg-blue-500/10 text-blue-500"
                    change="+3 this week"
                    isLoading={isLoading}
                  />
                  <QuickStatsCard
                    title="Quizzes Attempted"
                    value={overviewData?.quizzesAttempted || 0}
                    icon={BookOpen}
                    color="bg-green-500/10 text-green-500"
                    change="+12 this week"
                    isLoading={isLoading}
                  />
                  <QuickStatsCard
                    title="Average Score"
                    value={
                      overviewData?.averageScore
                        ? `${overviewData.averageScore}%`
                        : "0%"
                    }
                    icon={Target}
                    color="bg-purple-500/10 text-purple-500"
                    change="+5.2% this month"
                    isLoading={isLoading}
                  />
                  <QuickStatsCard
                    title="Total Participants"
                    value={overviewData?.totalParticipants || 0}
                    icon={Users}
                    color="bg-emerald-500/10 text-emerald-500"
                    change="+24 this week"
                    isLoading={isLoading}
                  />
                </>
              )}
            </motion.div>

            <motion.div
              className="grid grid-cols-1 gap-8 lg:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <AnalyticsCard
                title="Creator Analytics"
                description="Deep insights into the quizzes you've created and their performance across all participants"
                href="/analytics/my-quizzes"
                icon={Brain}
                color="blue"
                features={[
                  "Quiz performance metrics & trends",
                  "Participant engagement analytics",
                  "Question-level success analysis",
                  "Popular quiz rankings & visibility",
                  "Score distribution patterns",
                ]}
              />
              <AnalyticsCard
                title="Participant Analytics"
                description="Track your personal quiz-taking journey and discover insights about your learning progress"
                href="/analytics/my-attempts"
                icon={TrendingUp}
                color="green"
                features={[
                  "Personal performance trends & growth",
                  "Strength & improvement areas",
                  "Achievement tracking & milestones",
                  "Learning streaks & consistency",
                  "Favorite topic analysis & preferences",
                ]}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
