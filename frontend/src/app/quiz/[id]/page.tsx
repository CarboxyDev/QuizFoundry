"use client";

import { ProtectedRouteGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  Question,
  QuestionOption,
  Quiz,
  SubmitQuizResult,
} from "@/lib/quiz-api";
import { getQuizById, submitQuiz } from "@/lib/quiz-api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  Check,
  CheckCircle,
  CheckLine,
  Clock,
  Loader2,
  Play,
  Share2,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type UserAnswers = Record<string, string>;

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const headerVariants = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const questionVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  hover: {
    y: -2,
  },
};

const optionVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  hover: { x: 4, transition: { duration: 0.2 } },
};

const QuizLoadingSkeleton = () => (
  <div className="from-background via-muted/30 to-muted/50 min-h-screen bg-gradient-to-br">
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="space-y-8">
        {/* Navigation skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>

        {/* Hero header skeleton */}
        <div className="from-muted/20 to-muted/40 relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r p-8 shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-3/4 rounded-lg" />
                <Skeleton className="h-5 w-1/2 rounded-lg" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-36 rounded-full" />
            </div>
          </div>
        </div>

        {/* Question skeletons */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-background/80 relative overflow-hidden rounded-xl border p-6 shadow-lg backdrop-blur-sm"
          >
            {/* Question header */}
            <div className="mb-6 flex items-start gap-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4 rounded-lg" />
              </div>
            </div>

            {/* Options skeleton */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="border-border/50 flex items-center gap-4 rounded-lg border p-4"
                >
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 flex-1 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Submit section skeleton */}
        <div className="from-muted/20 to-muted/40 mt-16 overflow-hidden rounded-2xl bg-gradient-to-r p-8 text-center shadow-xl">
          <div className="space-y-6">
            <Skeleton className="mx-auto h-12 w-12 rounded-full" />
            <Skeleton className="mx-auto h-8 w-48 rounded-lg" />
            <Skeleton className="mx-auto h-6 w-80 rounded-lg" />
            <Skeleton className="mx-auto h-12 w-40 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const QuizError = () => (
  <div className="from-background via-muted/30 to-muted/50 flex min-h-screen items-center justify-center bg-gradient-to-br">
    <motion.div
      className="mx-4 w-full max-w-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-background/80 relative overflow-hidden rounded-2xl border p-8 shadow-xl backdrop-blur-sm">
        <div className="text-center">
          <motion.div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <XCircle className="h-8 w-8 text-red-500" />
          </motion.div>
          <h2 className="mb-3 text-2xl font-bold">Quiz Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The quiz you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Link href="/dashboard">
            <Button className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  </div>
);

const QuizHeader = ({
  quiz,
  isSubmitted,
  userAnswersCount,
  collapsed,
  onShare,
  shareText,
}: {
  quiz: Quiz;
  isSubmitted: boolean;
  userAnswersCount: number;
  collapsed: boolean;
  onShare: () => void;
  shareText: string;
}) => (
  <motion.div
    animate={{
      opacity: collapsed ? 0 : 1,
      y: collapsed ? -20 : 0,
      scale: collapsed ? 0.98 : 1,
    }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
    className="relative mb-12"
  >
    {/* Navigation */}
    <div className="mb-8 flex items-center justify-between">
      <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
        <Link href="/dashboard">
          <Button variant="ghost" className="hover:bg-accent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          onClick={onShare}
          className="flex items-center gap-2 backdrop-blur-sm"
        >
          <Share2 className="h-4 w-4" />
          {shareText}
        </Button>
      </motion.div>
    </div>

    {/* Hero Header */}
    <motion.div
      className="from-primary to-primary/80 text-primary-foreground relative overflow-hidden rounded-2xl bg-gradient-to-r p-8 shadow-xl"
      variants={headerVariants}
      initial="initial"
      animate="animate"
      whileHover={{
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative z-10">
        <motion.div
          className="mb-6 flex items-center gap-4"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div
            className="bg-primary-foreground/20 rounded-md p-3 backdrop-blur-sm"
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            }}
            transition={{ duration: 0.2 }}
          >
            <Brain className="h-8 w-8" />
          </motion.div>
          <div className="flex-1">
            <motion.h1
              className="text-2xl font-bold drop-shadow-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {quiz.title}
            </motion.h1>
            {quiz.description && (
              <motion.p
                className="text-primary-foreground/90 text-sm font-medium"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {quiz.description}
              </motion.p>
            )}
          </div>
        </motion.div>

        <motion.div
          className="text-primary-foreground/90 flex flex-wrap items-center gap-4 text-sm font-medium"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.div
            className="bg-primary-foreground/10 flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <Clock className="h-4 w-4" />
            <span>{quiz.questions?.length || 0} questions</span>
          </motion.div>
          <motion.div
            className={cn(
              "bg-primary-foreground/10 flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm",
            )}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <Trophy className="h-4 w-4" />
            <span className="capitalize">{quiz.difficulty}</span>
          </motion.div>
          {quiz.is_ai_generated && (
            <motion.div
              className="bg-primary-foreground/10 flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Generated</span>
            </motion.div>
          )}
          {!isSubmitted && (
            <motion.div
              className="bg-primary-foreground/10 flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <Check className="h-4 w-4" />
              <span>
                {userAnswersCount}/{quiz.questions?.length || 0} completed
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="bg-primary-foreground/10 absolute -top-4 -right-4 h-24 w-24 rounded-full"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="bg-primary-foreground/5 absolute -bottom-8 -left-8 h-32 w-32 rounded-full"
        animate={{ scale: [1, 1.2, 1], rotate: [360, 180, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  </motion.div>
);

const QuizResultsCard = ({
  result,
  quiz,
  onRetake,
}: {
  result: SubmitQuizResult;
  quiz: Quiz;
  onRetake: () => void;
}) => {
  const percentage = Math.round(result.percentage);

  const {
    icon: ResultIcon,
    headline,
    message,
  } = useMemo(() => {
    if (percentage >= 80) {
      return {
        icon: Trophy,
        headline: "Outstanding Performance!",
        message: "You've mastered this quiz with excellent results!",
      };
    } else if (percentage >= 60) {
      return {
        icon: CheckCircle,
        headline: "Great Job!",
        message: "You're on the right track. Keep up the good work!",
      };
    } else {
      return {
        icon: Zap,
        headline: "Keep Going!",
        message: "Every attempt makes you stronger. Ready to try again?",
      };
    }
  }, [percentage]);

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="from-primary/10 to-primary/5 relative overflow-hidden rounded-2xl bg-gradient-to-r p-8 shadow-xl">
        <div className="relative z-10 space-y-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ResultIcon className="text-primary mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-2 text-2xl font-bold">{headline}</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
          </motion.div>

          <motion.div
            className="mx-auto max-w-md p-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex flex-col items-center space-y-6">
              <motion.div
                className="relative h-32 w-32"
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                <svg
                  className="h-32 w-32 -rotate-90 transform"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted/30"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeLinecap="round"
                    className={cn(
                      percentage >= 80
                        ? "text-green-500"
                        : percentage >= 60
                          ? "text-primary"
                          : percentage >= 40
                            ? "text-yellow-500"
                            : "text-red-500",
                    )}
                    initial={{ strokeDasharray: "0 314" }}
                    animate={{
                      strokeDasharray: `${(percentage / 100) * 314} 314`,
                    }}
                    transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                  />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className={cn(
                      "text-3xl font-bold",
                      percentage >= 80
                        ? "text-green-600"
                        : percentage >= 60
                          ? "text-primary"
                          : percentage >= 40
                            ? "text-yellow-600"
                            : "text-red-600",
                    )}
                  >
                    {percentage}%
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    className="text-muted-foreground text-xs font-medium"
                  >
                    SCORE
                  </motion.div>
                </div>
              </motion.div>

              {/* Score Breakdown */}
              <motion.div
                className="w-full space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                {/* Main Score */}
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {result.score} out of {quiz.questions?.length || 0}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    questions answered correctly
                  </div>
                </div>

                {/* Visual breakdown */}
                <div className="space-y-3">
                  {/* Correct answers bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted/50 relative h-2 overflow-hidden rounded-full">
                        <motion.div
                          className="h-full rounded-full bg-green-500"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(result.score / (quiz.questions?.length || 1)) * 100}%`,
                          }}
                          transition={{ duration: 1, delay: 1.6 }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {result.score}
                    </div>
                  </div>

                  {/* Incorrect answers bar */}
                  {(quiz.questions?.length || 0) - result.score > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted/50 relative h-2 overflow-hidden rounded-full">
                          <motion.div
                            className="h-full rounded-full bg-red-500"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(((quiz.questions?.length || 0) - result.score) / (quiz.questions?.length || 1)) * 100}%`,
                            }}
                            transition={{ duration: 1, delay: 1.8 }}
                          />
                        </div>
                      </div>
                      <div className="text-sm font-medium text-red-600">
                        {(quiz.questions?.length || 0) - result.score}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onRetake}
              size="lg"
              className="bg-background/80 hover:bg-background/90 backdrop-blur-sm"
              variant="outline"
            >
              <Play className="mr-2 h-4 w-4" />
              Retake Quiz
            </Button>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="bg-primary/20 absolute -top-4 -right-4 h-24 w-24 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="bg-primary/10 absolute -bottom-6 -left-6 h-32 w-32 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};

const QuestionCard = ({
  question,
  index,
  userAnswer,
  isSubmitted,
  questionResult,
  onAnswerChange,
}: {
  question: Question;
  index: number;
  userAnswer?: string;
  isSubmitted: boolean;
  questionResult?: SubmitQuizResult["results"][number];
  onAnswerChange: (questionId: string, optionId: string) => void;
}) => {
  const isAnswered = !!userAnswer;
  const isCorrect = questionResult?.isCorrect ?? false;
  const isIncorrect = isAnswered && !isCorrect;

  return (
    <motion.div
      className="relative"
      variants={questionVariants}
      initial="initial"
      animate="animate"
      whileHover={!isSubmitted ? "hover" : undefined}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Answered badge */}
      <AnimatePresence>
        {!isSubmitted && isAnswered && (
          <motion.div
            className="absolute -top-3 -right-3 z-20"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full shadow-lg">
              <Check strokeWidth={3} className="h-5 w-5 text-white" />
            </div>
          </motion.div>
        )}
        {isSubmitted && (
          <motion.div
            className="absolute -top-3 -right-3 z-20"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full shadow-lg",
                isCorrect
                  ? "bg-green-500"
                  : isIncorrect
                    ? "bg-red-500"
                    : "bg-gray-500",
              )}
            >
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-white" />
              ) : isIncorrect ? (
                <XCircle className="h-5 w-5 text-white" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-white" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "bg-background/80 relative overflow-hidden rounded-xl border-2 p-6 shadow-lg backdrop-blur-sm transition-all duration-300",
          !isSubmitted && "hover:shadow-xl",
          !isSubmitted &&
            isAnswered &&
            "border-primary/50 ring-primary/10 ring-4",
          !isSubmitted &&
            !isAnswered &&
            "border-border/50 hover:border-primary/30",
          isSubmitted && isCorrect && "border-green-500/50 bg-green-500/5",
          isSubmitted && isIncorrect && "border-red-500/50 bg-red-500/5",
          isSubmitted && !isAnswered && "border-gray-400/50 bg-gray-400/5",
        )}
      >
        <div className="mb-6">
          <div className="mb-3 flex items-start gap-4">
            <motion.div
              className={cn(
                "flex size-10 items-center justify-center rounded-sm text-lg font-bold transition-colors",
                !isSubmitted && "bg-primary/10 text-primary",
                isSubmitted && isCorrect && "bg-green-500/20 text-green-600",
                isSubmitted && isIncorrect && "bg-red-500/20 text-red-600",
                isSubmitted && !isAnswered && "bg-gray-400/20 text-gray-600",
              )}
              whileHover={{ scale: 1.1 }}
            >
              {index + 1}
            </motion.div>
            <h3 className="flex-1 text-lg leading-relaxed font-semibold">
              {question.question_text}
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          {question.question_options
            ?.sort(
              (a: QuestionOption, b: QuestionOption) =>
                a.order_index - b.order_index,
            )
            .map((option: QuestionOption, optionIndex) => {
              const isSelected = userAnswer === option.id;
              const isCorrectOption =
                option.id === questionResult?.correctOptionId;

              return (
                <motion.div
                  key={option.id}
                  variants={optionVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: optionIndex * 0.1 }}
                  whileHover={!isSubmitted ? "hover" : undefined}
                  onClick={() =>
                    !isSubmitted && onAnswerChange(question.id, option.id)
                  }
                  className={cn(
                    "group relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200",
                    isSubmitted
                      ? {
                          "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300":
                            isCorrectOption,
                          "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300":
                            isSelected && !isCorrectOption,
                          "border-muted/50 bg-muted/20 text-muted-foreground":
                            !isSelected && !isCorrectOption,
                        }
                      : {
                          "border-primary bg-primary/10 text-primary shadow-md":
                            isSelected,
                          "border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md":
                            !isSelected,
                        },
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                        isSubmitted
                          ? isCorrectOption
                            ? "border-green-500 bg-green-500"
                            : isSelected && !isCorrectOption
                              ? "border-red-500 bg-red-500"
                              : "border-gray-400"
                          : isSelected
                            ? "border-primary bg-primary"
                            : "border-border group-hover:border-primary/50",
                      )}
                    >
                      {(isSelected || isCorrectOption) && (
                        <motion.div
                          className="h-2 w-2 rounded-full bg-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>

                    <span className="flex-1 font-medium">
                      {option.option_text}
                    </span>

                    {isSubmitted && (
                      <AnimatePresence>
                        {isCorrectOption && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </motion.div>
                        )}
                        {isSelected && !isCorrectOption && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <XCircle className="h-5 w-5 text-red-600" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </motion.div>
  );
};

const StickyQuizHeader = ({
  show,
  quiz,
  attempted,
  onShare,
  shareText,
}: {
  show: boolean;
  quiz: Quiz;
  attempted: number;
  onShare: () => void;
  shareText: string;
}) => {
  const total = quiz.questions?.length || 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="pointer-events-none fixed top-0 right-0 left-0 z-40 flex justify-center"
        >
          <div className="bg-background/80 pointer-events-auto mx-auto w-full max-w-5xl rounded-b-xl border-x border-b px-6 py-3 shadow-lg backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>

              <div className="flex items-center gap-4">
                <h3 className="line-clamp-1 max-w-[200px] font-semibold xl:max-w-[400px] 2xl:max-w-[500px]">
                  {quiz.title}
                </h3>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {attempted}/{total}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onShare}
                className="h-8 w-8"
                title={shareText}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SubmitSection = ({
  canSubmit,
  isSubmitting,
  onSubmit,
}: {
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}) => {
  return (
    <motion.div
      className="mt-16 mb-32"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="from-primary to-primary/80 relative overflow-hidden rounded-2xl bg-gradient-to-r p-8 text-center shadow-xl">
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CheckLine className="mx-auto mb-4 h-12 w-12 text-white" />
            <h3 className="mb-2 text-2xl font-bold text-white">
              Ready to Submit?
            </h3>
            <p className="text-primary-foreground/90 mb-6">
              {canSubmit
                ? "All questions answered! Submit your quiz to see your results."
                : "Please answer all questions before submitting your quiz."}
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: canSubmit ? 1.05 : 1 }}
            whileTap={{ scale: canSubmit ? 0.95 : 1 }}
          >
            <Button
              onClick={onSubmit}
              disabled={!canSubmit || isSubmitting}
              size="lg"
              className="text-primary bg-white px-8 py-3 text-lg font-semibold hover:bg-white/90 disabled:bg-white/50"
            >
              <Loader2
                className={cn(
                  "mr-2 h-5 w-5 animate-spin",
                  !isSubmitting && "hidden",
                )}
              />
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          </motion.div>
        </div>
        <motion.div
          className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};

export default function QuizPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<SubmitQuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareText, setShareText] = useState("Share Quiz");

  const headerRef = useRef<HTMLDivElement | null>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const { bottom } = headerRef.current.getBoundingClientRect();
      setShowStickyHeader(bottom <= 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const {
    data: quiz,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuizById(quizId),
    enabled: !!quizId,
  });

  const questionResultsMap = useMemo(() => {
    if (!result) return new Map();
    return new Map(result.results.map((r) => [r.questionId, r]));
  }, [result]);

  const handleAnswerChange = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!quiz?.questions) return;
    setIsSubmitting(true);
    try {
      const answers = quiz.questions.map((q) => ({
        questionId: q.id,
        optionId: userAnswers[q.id],
      }));
      const res = await submitQuiz(quizId, { answers });
      setResult(res);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareText("Copied!");
      setTimeout(() => setShareText("Share Quiz"), 3000);
      toast.success("Quiz URL copied to clipboard");
    } catch (err) {
      console.error("Failed to copy URL:", err);
      toast.error("Failed to copy URL");
    }
  };

  const canSubmit = useMemo(() => {
    if (!quiz?.questions) return false;
    return quiz.questions.every((question) => userAnswers[question.id]);
  }, [quiz?.questions, userAnswers]);

  const renderContent = () => {
    if (isLoading) return <QuizLoadingSkeleton />;
    if (error) return <QuizError />;
    if (!quiz) return null;

    const attemptedCount = Object.keys(userAnswers).length;

    return (
      <>
        <StickyQuizHeader
          show={showStickyHeader}
          quiz={quiz}
          attempted={attemptedCount}
          onShare={handleShare}
          shareText={shareText}
        />

        <motion.div
          className="from-background via-muted/30 to-muted/50 min-h-screen bg-gradient-to-br"
          initial="initial"
          animate="animate"
          variants={pageVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="container mx-auto max-w-5xl px-4 py-8">
            <div ref={headerRef}>
              <QuizHeader
                quiz={quiz}
                isSubmitted={isSubmitted}
                userAnswersCount={attemptedCount}
                collapsed={showStickyHeader}
                onShare={handleShare}
                shareText={shareText}
              />
            </div>

            {/* Remove the results card from here - it will be moved to the end */}
            {/* {isSubmitted && result && (
              <QuizResultsCard result={result} quiz={quiz} />
            )} */}

            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                staggerChildren: 0.1,
                delayChildren: 0.2,
              }}
            >
              {quiz.questions?.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  userAnswer={userAnswers[question.id]}
                  isSubmitted={isSubmitted}
                  questionResult={questionResultsMap.get(question.id)}
                  onAnswerChange={handleAnswerChange}
                />
              ))}
            </motion.div>

            {/* Show results at the end, before the submit section */}
            {isSubmitted && result && (
              <div className="mt-16">
                <QuizResultsCard
                  result={result}
                  quiz={quiz}
                  onRetake={handleRetake}
                />
              </div>
            )}

            {!isSubmitted && (
              <SubmitSection
                canSubmit={canSubmit}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </motion.div>
      </>
    );
  };

  return <ProtectedRouteGuard>{renderContent()}</ProtectedRouteGuard>;
}
