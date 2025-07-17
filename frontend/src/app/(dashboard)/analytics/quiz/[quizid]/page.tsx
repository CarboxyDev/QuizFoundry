"use client";

import { DifficultyIcon } from "@/components/DifficultyIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import {
  getQuizAnalytics,
  getQuizById,
  type Quiz,
  type QuizAnalytics,
} from "@/lib/quiz-api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  PieChart,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
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
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ScoreDistributionCard({
  distribution,
}: {
  distribution: QuizAnalytics["performance"]["scoreDistribution"];
}) {
  const maxCount = Math.max(...distribution.map((d) => d.count));

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Score Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {distribution.map((range, index) => (
            <div key={range.range} className="flex items-center gap-3">
              <div className="w-16 text-sm font-medium">{range.range}</div>
              <div className="bg-muted h-3 flex-1 overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(range.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
              <div className="text-muted-foreground w-12 text-right text-sm">
                {range.count}
              </div>
              <div className="text-muted-foreground w-12 text-right text-xs">
                {range.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TopPerformersCard({
  performers,
}: {
  performers: QuizAnalytics["engagement"]["topPerformers"];
}) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {performers.slice(0, 5).map((performer, index) => (
            <motion.div
              key={index}
              className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-2 transition-colors"
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
                <Avatar className="h-8 w-8">
                  <AvatarImage src={performer.userAvatarUrl} />
                  <AvatarFallback>
                    {performer.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{performer.userName}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDate(performer.completedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">
                  {performer.percentage.toFixed(1)}%
                </p>
                <p className="text-muted-foreground text-xs">
                  {performer.score} points
                </p>
              </div>
            </motion.div>
          ))}
          {performers.length === 0 && (
            <p className="text-muted-foreground py-4 text-center">
              No attempts yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionAnalysisCard({
  questions,
}: {
  questions: QuizAnalytics["questions"];
}) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Question Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <motion.div
              key={question.questionId}
              className="border-border/40 space-y-3 rounded-lg border p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Q{question.orderIndex + 1}. {question.questionText}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {question.totalAnswers} responses
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {question.correctRate.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground text-xs">correct rate</p>
                </div>
              </div>

              <div className="space-y-2">
                {question.optionAnalysis.map((option, optionIndex) => (
                  <div
                    key={option.optionId}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full",
                        option.isCorrect ? "bg-green-500" : "bg-muted",
                      )}
                    >
                      {option.isCorrect && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 text-sm">{option.optionText}</div>
                    <div className="bg-muted h-2 w-24 overflow-hidden rounded-full">
                      <motion.div
                        className={cn(
                          "h-full",
                          option.isCorrect ? "bg-green-500" : "bg-gray-400",
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${option.percentage}%` }}
                        transition={{
                          duration: 0.8,
                          delay: index * 0.1 + optionIndex * 0.05,
                        }}
                      />
                    </div>
                    <div className="text-muted-foreground w-12 text-right text-xs">
                      {option.percentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsPageSkeleton() {
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

          <Skeleton className="h-96" />
        </div>
      </div>
    </div>
  );
}

export default function QuizAnalyticsPage() {
  const params = useParams();
  const quizId = params.quizid as string;

  const { data: quiz, isLoading: quizLoading } = useQuery<Quiz>({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuizById(quizId),
  });

  const { data: analytics, isLoading: analyticsLoading } =
    useQuery<QuizAnalytics>({
      queryKey: ["quiz-analytics", quizId],
      queryFn: () => getQuizAnalytics(quizId),
    });

  const isLoading = quizLoading || analyticsLoading;

  if (isLoading) {
    return <AnalyticsPageSkeleton />;
  }

  if (!quiz || !analytics) {
    return (
      <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">
            Quiz or analytics data not found
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
                className="mb-4 flex items-center justify-between"
                whileHover={{ x: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/my-quizzes">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to My Quizzes
                  </Button>
                </Link>
                <Link href={`/my-quizzes/edit/${quizId}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Quiz
                  </Button>
                </Link>
              </motion.div>

              <h1 className="mb-2 text-4xl font-bold tracking-tight">
                Quiz Analytics
              </h1>
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-muted-foreground text-2xl font-semibold">
                  {quiz.title}
                </h2>
                <DifficultyIcon difficulty={quiz.difficulty} />
              </div>
              <p className="text-muted-foreground">
                Comprehensive insights and performance metrics for your quiz
              </p>
            </div>

            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <StatCard
                title="Total Attempts"
                value={analytics.overview.totalAttempts}
                icon={Activity}
                color="bg-blue-500/10 text-blue-500"
              />
              <StatCard
                title="Unique Users"
                value={analytics.overview.uniqueUsers}
                icon={Users}
                color="bg-green-500/10 text-green-500"
              />
              <StatCard
                title="Average Score"
                value={`${analytics.overview.averageScore.toFixed(1)}%`}
                icon={Target}
                color="bg-purple-500/10 text-purple-500"
              />
              <StatCard
                title="Total Questions"
                value={analytics.questions.length}
                icon={Brain}
                color="bg-emerald-500/10 text-emerald-500"
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <ScoreDistributionCard
              distribution={analytics.performance.scoreDistribution}
            />
            <TopPerformersCard
              performers={analytics.engagement.topPerformers}
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
                  Recent Attempts
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
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          >
            <QuestionAnalysisCard questions={analytics.questions} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
