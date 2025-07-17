"use client";

import { DifficultyIcon } from "@/components/DifficultyIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import { getCreatorAnalytics, type CreatorAnalytics } from "@/lib/quiz-api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Brain,
  Calendar,
  Clock,
  Eye,
  PieChart,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
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

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
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

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  description,
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  description?: string;
  trend?: "up" | "down";
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
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{value}</p>
                {trend && (
                  <div
                    className={cn(
                      "flex items-center text-xs",
                      trend === "up" ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {trend === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                )}
              </div>
              {description && (
                <p className="text-muted-foreground mt-1 text-xs">
                  {description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DifficultyBreakdownCard({
  breakdown,
}: {
  breakdown: CreatorAnalytics["breakdown"]["byDifficulty"];
}) {
  const difficulties = Object.entries(breakdown) as [
    "easy" | "medium" | "hard",
    { count: number; avgScore: number; attempts: number },
  ][];

  const totalQuizzes = difficulties.reduce(
    (sum, [, data]) => sum + data.count,
    0,
  );

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Quiz Breakdown by Difficulty
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {difficulties.map(([difficulty, data], index) => (
            <div key={difficulty} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DifficultyIcon difficulty={difficulty} />
                  <span className="text-sm font-medium capitalize">
                    {difficulty}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">
                    {data.count} quizzes
                  </span>
                  <p className="text-muted-foreground text-xs">
                    {data.avgScore.toFixed(1)}% avg score
                  </p>
                </div>
              </div>
              <div className="bg-muted h-3 overflow-hidden rounded-full">
                <motion.div
                  className={cn(
                    "h-full",
                    difficulty === "easy" && "bg-green-500",
                    difficulty === "medium" && "bg-yellow-500",
                    difficulty === "hard" && "bg-red-500",
                  )}
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      totalQuizzes > 0
                        ? `${(data.count / totalQuizzes) * 100}%`
                        : "0%",
                  }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>{data.attempts} total attempts</span>
                <span>
                  {totalQuizzes > 0
                    ? ((data.count / totalQuizzes) * 100).toFixed(1)
                    : 0}
                  % of quizzes
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TopPerformingQuizzesCard({
  quizzes,
}: {
  quizzes: CreatorAnalytics["performance"]["topPerformingQuizzes"];
}) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Performing Quizzes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quizzes.slice(0, 5).map((quiz, index) => (
            <motion.div
              key={quiz.quizId}
              className="hover:bg-muted/50 group flex items-center gap-3 rounded-lg p-3 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    index === 0 && "bg-yellow-500/20 text-yellow-500",
                    index === 1 && "bg-gray-500/20 text-gray-500",
                    index === 2 && "bg-orange-500/20 text-orange-500",
                    index > 2 && "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </div>
                <DifficultyIcon
                  difficulty={quiz.difficulty as "easy" | "medium" | "hard"}
                />
              </div>
              <div className="flex-1">
                <p className="group-hover:text-primary text-sm font-medium transition-colors">
                  {quiz.title}
                </p>
                <p className="text-muted-foreground text-xs">
                  Created {formatDate(quiz.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{quiz.avgScore.toFixed(1)}%</p>
                <p className="text-muted-foreground text-xs">
                  {quiz.attempts} attempts
                </p>
              </div>
              <div className="opacity-0 transition-opacity group-hover:opacity-100">
                <Link href={`/analytics/quiz/${quiz.quizId}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
          {quizzes.length === 0 && (
            <p className="text-muted-foreground py-8 text-center">
              No quizzes created yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreDistributionCard({
  distribution,
}: {
  distribution: CreatorAnalytics["performance"]["scoreDistribution"];
}) {
  const totalAttempts = distribution.reduce((sum, d) => sum + d.count, 0);

  const getBarColor = (range: string) => {
    if (range.includes("90-100")) return "bg-green-500";
    if (range.includes("80-89")) return "bg-blue-500";
    if (range.includes("70-79")) return "bg-purple-500";
    if (range.includes("60-69")) return "bg-yellow-500";
    if (range.includes("50-59")) return "bg-orange-500";
    return "bg-primary";
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Score Distribution Across All Quizzes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {distribution.map((range, index) => (
            <div key={range.range} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{range.range}</span>
                  <span className="text-muted-foreground text-xs">
                    {range.count} {range.count === 1 ? "attempt" : "attempts"}
                  </span>
                </div>
                <span className="text-sm font-bold">
                  {range.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="bg-muted h-3 overflow-hidden rounded-full">
                <motion.div
                  className={cn("h-full", getBarColor(range.range))}
                  initial={{ width: 0 }}
                  animate={{ width: `${range.percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>

        {totalAttempts > 0 && (
          <div className="border-border/40 mt-6 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                Total Quiz Attempts
              </span>
              <span className="text-xl font-bold">{totalAttempts}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MostPopularQuizzesCard({
  quizzes,
}: {
  quizzes: CreatorAnalytics["topQuizzes"]["mostPopular"];
}) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Most Popular Quizzes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quizzes.slice(0, 5).map((quiz, index) => (
            <motion.div
              key={quiz.quizId}
              className="hover:bg-muted/50 group flex items-center gap-3 rounded-lg p-3 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <p className="group-hover:text-primary text-sm font-medium transition-colors">
                  {quiz.title}
                </p>
                <p className="text-muted-foreground text-xs">
                  {quiz.uniqueUsers} unique users • {quiz.avgScore.toFixed(1)}%
                  avg score
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{quiz.attempts}</p>
                <p className="text-muted-foreground text-xs">attempts</p>
              </div>
              <div className="opacity-0 transition-opacity group-hover:opacity-100">
                <Link href={`/analytics/quiz/${quiz.quizId}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
          {quizzes.length === 0 && (
            <p className="text-muted-foreground py-4 text-center">
              No quiz attempts yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CreatorAnalyticsPageSkeleton() {
  return (
    <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="from-background via-muted/30 to-muted/50 min-h-screen flex-1 bg-gradient-to-br">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery<CreatorAnalytics>({
    queryKey: ["creator-analytics"],
    queryFn: () => getCreatorAnalytics(),
  });

  if (isLoading) {
    return <CreatorAnalyticsPageSkeleton />;
  }

  if (!analytics) {
    return (
      <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">
            Unable to load creator analytics
          </p>
        </div>
      </div>
    );
  }

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
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            className="mb-8"
            variants={headerVariants}
            initial="initial"
            animate="animate"
          >
            <div className="mb-6">
              <motion.div
                className="mb-4 flex items-center gap-4"
                whileHover={{ x: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/analytics">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Analytics
                  </Button>
                </Link>
              </motion.div>

              <h1 className="mb-2 text-4xl font-bold tracking-tight">
                Creator Analytics
              </h1>
              <p className="text-muted-foreground text-lg">
                Comprehensive insights into the performance of the quizzes you
                have created.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatCard
              title="Total Quizzes"
              value={analytics.overview.totalQuizzes}
              icon={Brain}
              color="bg-blue-500/10 text-blue-500"
              description={`${analytics.overview.totalQuestions} questions`}
            />
            <StatCard
              title="Total Attempts"
              value={analytics.overview.totalAttempts}
              icon={Activity}
              color="bg-green-500/10 text-green-500"
              description={`${analytics.overview.averageAttemptsPerQuiz.toFixed(1)} per quiz`}
            />
            <StatCard
              title="Unique Users"
              value={analytics.overview.totalUniqueUsers}
              icon={Users}
              color="bg-purple-500/10 text-purple-500"
              description="across all quizzes"
            />
            <StatCard
              title="Average Score"
              value={`${analytics.overview.averageScore.toFixed(1)}%`}
              icon={Target}
              color="bg-emerald-500/10 text-emerald-500"
              description="across all attempts"
              trend="up"
            />
          </motion.div>

          <motion.div
            className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <DifficultyBreakdownCard
              breakdown={analytics.breakdown.byDifficulty}
            />
            <TopPerformingQuizzesCard
              quizzes={analytics.performance.topPerformingQuizzes}
            />
          </motion.div>

          <motion.div
            className="mb-8"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <motion.div variants={cardVariants}>
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-600/10 p-6 transition-all duration-300 hover:from-blue-500/10 hover:to-blue-600/15 hover:shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-blue-500/20 p-3">
                          <Clock className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {analytics.engagement.recentActivity.last24Hours}
                          </p>
                          <p className="text-muted-foreground text-sm font-medium">
                            Last 24 hours
                          </p>
                        </div>
                      </div>
                      <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>
                  </motion.div>
                  <motion.div variants={cardVariants}>
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/5 to-green-600/10 p-6 transition-all duration-300 hover:from-green-500/10 hover:to-green-600/15 hover:shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-green-500/20 p-3">
                          <Calendar className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {analytics.engagement.recentActivity.last7Days}
                          </p>
                          <p className="text-muted-foreground text-sm font-medium">
                            Last 7 days
                          </p>
                        </div>
                      </div>
                      <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>
                  </motion.div>
                  <motion.div variants={cardVariants}>
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/5 to-purple-600/10 p-6 transition-all duration-300 hover:from-purple-500/10 hover:to-purple-600/15 hover:shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-purple-500/20 p-3">
                          <BarChart3 className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {analytics.engagement.recentActivity.last30Days}
                          </p>
                          <p className="text-muted-foreground text-sm font-medium">
                            Last 30 days
                          </p>
                        </div>
                      </div>
                      <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-purple-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          >
            <ScoreDistributionCard
              distribution={analytics.performance.scoreDistribution}
            />
            <MostPopularQuizzesCard
              quizzes={analytics.topQuizzes.mostPopular}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
