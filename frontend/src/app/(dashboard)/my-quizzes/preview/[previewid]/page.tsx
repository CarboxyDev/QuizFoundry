"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { Question, QuestionOption, QuizWithCreator } from "@/lib/quiz-api";
import { getQuizByIdForPreview } from "@/lib/quiz-api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  EyeOff,
  Sparkles,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
};

const QuizLoadingSkeleton = () => (
  <div className="from-background via-muted/30 to-muted/50 min-h-screen bg-gradient-to-br">
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Navigation skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
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
          <Link href="/my-quizzes">
            <Button className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Quizzes
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  </div>
);

const QuizHeader = ({
  quiz,
  showAnswers,
  onToggleAnswers,
  collapsed,
}: {
  quiz: QuizWithCreator;
  showAnswers: boolean;
  onToggleAnswers: () => void;
  collapsed: boolean;
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
        <Link href="/my-quizzes">
          <Button variant="ghost" className="hover:bg-accent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Quizzes
          </Button>
        </Link>
      </motion.div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Show Answers</span>
          <Switch checked={showAnswers} onCheckedChange={onToggleAnswers} />
          {showAnswers ? (
            <Eye className="text-primary h-4 w-4" />
          ) : (
            <EyeOff className="text-muted-foreground h-4 w-4" />
          )}
        </div>
        <Link href={`/my-quizzes/edit/${quiz.id}`}>
          <Button variant="outline" className="ml-2">
            <Edit className="mr-2 h-4 w-4" />
            Edit Quiz
          </Button>
        </Link>
      </div>
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
            className="bg-primary-foreground/10 flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm"
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
          <motion.div
            className="bg-primary-foreground/10 flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <User className="h-4 w-4" />
            <span>Created by {quiz.creator.name}</span>
          </motion.div>
          <motion.div
            className="bg-primary-foreground/10 flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <Eye className="h-4 w-4" />
            <span>Preview Mode</span>
          </motion.div>
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

const QuestionCard = ({
  question,
  index,
  showAnswers,
}: {
  question: Question;
  index: number;
  showAnswers: boolean;
}) => {
  const correctOption = question.question_options?.find(
    (option) => option.is_correct,
  );

  return (
    <motion.div
      className="relative"
      variants={questionVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Correct answer indicator */}
      <AnimatePresence>
        {showAnswers && correctOption && (
          <motion.div
            className="absolute -top-3 -right-3 z-20"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 shadow-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "bg-background/80 relative overflow-hidden rounded-xl border-2 p-6 shadow-lg backdrop-blur-sm transition-all duration-300",
          "border-border/50 hover:border-primary/30 hover:shadow-xl",
          showAnswers && "border-primary/50 ring-primary/10 ring-2",
        )}
      >
        <div className="mb-6">
          <div className="mb-3 flex items-start gap-4">
            <motion.div
              className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-sm text-lg font-bold transition-colors"
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
              const isCorrect = option.is_correct;

              return (
                <motion.div
                  key={option.id}
                  variants={optionVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: optionIndex * 0.1 }}
                  className={cn(
                    "group relative rounded-lg border-2 p-4 transition-all duration-200",
                    showAnswers && isCorrect
                      ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300"
                      : "border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                        showAnswers && isCorrect
                          ? "border-green-500 bg-green-500"
                          : "border-border group-hover:border-primary/50",
                      )}
                    >
                      {showAnswers && isCorrect && (
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

                    {showAnswers && isCorrect && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </motion.div>
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
  showAnswers,
  onToggleAnswers,
}: {
  show: boolean;
  quiz: QuizWithCreator;
  showAnswers: boolean;
  onToggleAnswers: () => void;
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
          className="pointer-events-none fixed top-0 right-0 left-64 z-40 flex justify-center"
        >
          <div className="bg-background/80 pointer-events-auto mx-auto w-full max-w-5xl rounded-b-xl border-x border-b px-6 py-3 shadow-lg backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <Link href="/my-quizzes">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>

              <div className="flex items-center gap-4">
                <h3 className="line-clamp-1 max-w-[150px] font-semibold xl:max-w-[300px] 2xl:max-w-[400px]">
                  {quiz.title}
                </h3>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  Preview • {total} questions
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={showAnswers}
                  onCheckedChange={onToggleAnswers}
                  className="scale-75"
                />
                {showAnswers ? (
                  <Eye className="text-primary h-4 w-4" />
                ) : (
                  <EyeOff className="text-muted-foreground h-4 w-4" />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function QuizPreviewPage() {
  const params = useParams();
  const quizId = params.previewid as string;

  const [showAnswers, setShowAnswers] = useState(false);
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
    queryKey: ["quiz-preview", quizId],
    queryFn: () => getQuizByIdForPreview(quizId),
    enabled: !!quizId,
  });

  const handleToggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  const renderContent = () => {
    if (isLoading) return <QuizLoadingSkeleton />;
    if (error) return <QuizError />;
    if (!quiz) return null;

    return (
      <>
        <StickyQuizHeader
          show={showStickyHeader}
          quiz={quiz}
          showAnswers={showAnswers}
          onToggleAnswers={handleToggleAnswers}
        />

        <motion.div
          className="from-background via-muted/30 to-muted/50 min-h-screen bg-gradient-to-br"
          initial="initial"
          animate="animate"
          variants={pageVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div ref={headerRef}>
              <QuizHeader
                quiz={quiz}
                showAnswers={showAnswers}
                onToggleAnswers={handleToggleAnswers}
                collapsed={showStickyHeader}
              />
            </div>

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
                  showAnswers={showAnswers}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </>
    );
  };

  return renderContent();
}
