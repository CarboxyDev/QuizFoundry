"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import {
  getParticipantAnalytics,
  type ParticipantAnalytics,
} from "@/lib/quiz-api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  CheckCircle,
  Clock,
  Flame,
  PieChart,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
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
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={cn("rounded-lg p-1.5 sm:p-2", color)}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs sm:text-sm">
                {title}
              </p>
              <div className="flex items-center gap-1 sm:gap-2">
                <p className="text-lg font-bold sm:text-2xl">{value}</p>
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

function PerformanceByDifficultyCard({
  strengths,
}: {
  strengths: ParticipantAnalytics["performance"]["strengthsByDifficulty"];
}) {
  const difficulties = Object.entries(strengths) as [
    "easy" | "medium" | "hard",
    { attempts: number; avgScore: number; improvement: number },
  ][];

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Performance by Difficulty
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {difficulties.map(([difficulty, data], index) => (
            <div key={difficulty} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">
                    {difficulty}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">
                    {data.avgScore.toFixed(1)}%
                  </span>
                  <p className="text-muted-foreground text-xs">
                    {data.attempts} attempts
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
                  animate={{ width: `${data.avgScore}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>Average score: {data.avgScore.toFixed(1)}%</span>
                {data.improvement !== 0 && (
                  <span
                    className={cn(
                      "font-medium",
                      data.improvement > 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {data.improvement > 0 ? "+" : ""}
                    {data.improvement.toFixed(1)}%{" "}
                    {data.improvement > 0 ? "improvement" : "decline"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreDistributionCard({
  distribution,
}: {
  distribution: ParticipantAnalytics["performance"]["scoreDistribution"];
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
          Score Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {distribution.map((range, index) => (
            <div key={index} className="space-y-2">
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

function AchievementsCard({
  achievements,
}: {
  achievements: ParticipantAnalytics["achievements"];
}) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements & Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="mx-auto mb-2 w-fit rounded-full bg-yellow-500/10 p-2 text-yellow-500 sm:p-3">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <p className="text-base font-bold sm:text-lg">
                {achievements.perfectScores}
              </p>
              <p className="text-muted-foreground text-xs">Perfect Scores</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 w-fit rounded-full bg-green-500/10 p-2 text-green-500 sm:p-3">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <p className="text-base font-bold sm:text-lg">
                {achievements.improvementRate.toFixed(1)}%
              </p>
              <p className="text-muted-foreground text-xs">Improvement Rate</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 w-fit rounded-full bg-blue-500/10 p-2 text-blue-500 sm:p-3">
                <Target className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <p className="text-base font-bold sm:text-lg">
                {achievements.consistencyScore.toFixed(1)}%
              </p>
              <p className="text-muted-foreground text-xs">Consistency</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Challenges</h4>
            {achievements.challenges.slice(0, 3).map((challenge, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "rounded-full p-1",
                        challenge.completed ? "bg-green-500/20" : "bg-muted",
                      )}
                    >
                      {challenge.completed ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Clock className="text-muted-foreground h-3 w-3" />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {challenge.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {challenge.progress.toFixed(0)}%
                  </span>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <motion.div
                    className={cn(
                      "h-full",
                      challenge.completed ? "bg-green-500" : "bg-blue-500",
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${challenge.progress}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  {challenge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentAttemptsCard({
  attempts,
}: {
  attempts: ParticipantAnalytics["recentAttempts"];
}) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Quiz Attempts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attempts.slice(0, 5).map((attempt, index) => (
            <Link href={`/quiz/${attempt.quizId}`} key={index}>
              <motion.div
                className="hover:bg-muted/50 group flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors sm:gap-3 sm:p-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="min-w-0 flex-1">
                  <p className="group-hover:text-primary truncate text-xs font-medium transition-colors sm:text-sm">
                    {attempt.quizTitle}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    by {attempt.creatorName || "Anonymous"} •{" "}
                    {formatDate(attempt.completedAt)}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-bold sm:text-sm">
                    {attempt.percentage.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {attempt.score} points
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
          {attempts.length === 0 && (
            <p className="text-muted-foreground py-8 text-center">
              No quiz attempts yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StreaksCard({
  streaks,
}: {
  streaks: ParticipantAnalytics["engagement"]["streaks"];
}) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Activity Streaks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <div className="space-y-2 text-center sm:space-y-3">
              <div className="mx-auto w-fit rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 p-3 text-orange-500 sm:p-4">
                <Flame className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <p className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                  {streaks.currentStreak}
                </p>
                <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                  Current Streak
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {streaks.currentStreak === 1 ? "day" : "days"} in a row
                </p>
              </div>
            </div>
            <div className="space-y-2 text-center sm:space-y-3">
              <div className="mx-auto w-fit rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-3 text-yellow-500 sm:p-4">
                <Star className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <p className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                  {streaks.longestStreak}
                </p>
                <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                  Best Streak
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  personal record
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card/60 rounded-xl border p-3 backdrop-blur-sm sm:p-5">
            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
              <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-500 sm:p-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div>
                <span className="text-xs font-semibold sm:text-sm">
                  Activity Timeline
                </span>
                <p className="text-muted-foreground text-xs">
                  Your recent quiz activity
                </p>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs sm:text-sm">
                  Last Active
                </span>
                <span className="text-xs font-medium sm:text-sm">
                  {formatDate(streaks.lastActive)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs sm:text-sm">
                  Streak Status
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  {streaks.currentStreak > 0 ? (
                    <>
                      <div className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-500">
                        Active
                      </div>
                      <span className="text-xs">🔥</span>
                    </>
                  ) : (
                    <div className="rounded-full bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-500">
                      Inactive
                    </div>
                  )}
                </div>
              </div>

              {streaks.currentStreak > 0 && (
                <div className="mt-2 rounded-lg border border-green-500/20 bg-green-500/5 p-2 sm:mt-3 sm:p-3">
                  <p className="text-xs font-medium text-green-600 sm:text-sm">
                    🎉 You&apos;re on fire! Keep your streak alive!
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Complete a quiz today to maintain your{" "}
                    {streaks.currentStreak}-day streak
                  </p>
                </div>
              )}

              {streaks.currentStreak === 0 && (
                <div className="mt-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-2 sm:mt-3 sm:p-3">
                  <p className="text-xs font-medium text-blue-500 sm:text-sm">
                    Ready to start a new streak?
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Take a quiz today to begin building your streak!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ParticipantAnalyticsPageSkeleton() {
  return (
    <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-screen flex-1">
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

export default function ParticipantAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery<ParticipantAnalytics>({
    queryKey: ["participant-analytics"],
    queryFn: () => getParticipantAnalytics(),
  });

  if (isLoading) {
    return <ParticipantAnalyticsPageSkeleton />;
  }

  if (!analytics) {
    return (
      <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">
            Unable to load participant analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
      <motion.div
        className="min-h-screen flex-1"
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs sm:gap-2 sm:text-sm"
                  >
                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Back to Analytics</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                </Link>
              </motion.div>

              <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-4xl">
                Participant Analytics
              </h1>
              <p className="text-muted-foreground text-sm sm:text-lg">
                Track your quiz performance across all quizzes you have taken.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:gap-4 md:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatCard
              title="Total Attempts"
              value={analytics.overview.totalAttempts}
              icon={Activity}
              color="bg-blue-500/10 text-blue-500"
              description={`across ${analytics.overview.uniqueQuizzes} quizzes`}
            />
            <StatCard
              title="Unique Quizzes"
              value={analytics.overview.uniqueQuizzes}
              icon={PieChart}
              color="bg-purple-500/10 text-purple-500"
              description="different quizzes taken"
            />
            <StatCard
              title="Average Score"
              value={`${analytics.overview.averageScore.toFixed(1)}%`}
              icon={Target}
              color="bg-green-500/10 text-green-500"
              description="across all attempts"
              trend="up"
            />
            <StatCard
              title="Highest Score"
              value={`${analytics.overview.highestScore.toFixed(1)}%`}
              icon={Trophy}
              color="bg-yellow-500/10 text-yellow-500"
              description="personal best"
            />
          </motion.div>

          <motion.div
            className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-2"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <PerformanceByDifficultyCard
              strengths={analytics.performance.strengthsByDifficulty}
            />
            <StreaksCard streaks={analytics.engagement.streaks} />
          </motion.div>

          <motion.div
            className="mb-6 sm:mb-8"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5 }}
          >
            <ScoreDistributionCard
              distribution={analytics.performance.scoreDistribution}
            />
            {/* <AchievementsCard achievements={analytics.achievements} /> */}
          </motion.div>

          <motion.div
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          >
            <RecentAttemptsCard attempts={analytics.recentAttempts} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
