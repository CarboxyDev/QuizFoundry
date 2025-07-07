"use client";

import { ProtectedRouteGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  CheckCircle,
  Clock,
  Loader2,
  Trophy,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

type UserAnswers = Record<string, string>;

const QuizLoadingSkeleton = () => (
  <div className="from-primary/5 to-background min-h-screen bg-gradient-to-br">
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-full" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="mb-6 h-6 w-full" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-14 w-full" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const QuizError = () => (
  <div className="from-primary/5 to-background flex min-h-screen items-center justify-center bg-gradient-to-br">
    <Card className="mx-4 w-full max-w-md">
      <CardContent className="pt-6 text-center">
        <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h2 className="mb-3 text-2xl font-bold">Quiz Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The quiz you&apos;re looking for doesn&apos;t exist or you don&apos;t
          have access to it.
        </p>
        <Link href="/quizzes">
          <Button className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Browse More Quizzes
          </Button>
        </Link>
      </CardContent>
    </Card>
  </div>
);

const QuizHeader = ({
  quiz,
  isSubmitted,
  userAnswersCount,
}: {
  quiz: Quiz;
  isSubmitted: boolean;
  userAnswersCount: number;
}) => (
  <div className="mb-8">
    <div className="mb-10 flex items-center justify-between">
      <Link href="/quizzes">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Browse More Quizzes
        </Button>
      </Link>
    </div>

    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <h1 className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
          {quiz.title}
        </h1>
      </div>

      {quiz.description && (
        <p className="text-muted-foreground mx-auto max-w-2xl">
          {quiz.description}
        </p>
      )}

      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="text-primary h-4 w-4" />
          <span>{quiz.questions?.length || 0} questions</span>
        </div>
        <Badge
          className={cn(
            "rounded-2xl border px-3 py-1 text-xs font-medium capitalize shadow-sm hover:bg-transparent",
            quiz.difficulty === "easy" &&
              "border-green-600 bg-green-600/10 text-green-500",
            quiz.difficulty === "medium" &&
              "border-amber-500 bg-amber-500/10 text-amber-400",
            quiz.difficulty === "hard" &&
              "border-red-600 bg-red-600/10 text-red-500",
          )}
        >
          {quiz.difficulty}
        </Badge>
        {quiz.is_ai_generated && (
          <Badge variant="outline" className="text-xs">
            AI Generated
          </Badge>
        )}
        {!isSubmitted && (
          <div className="text-primary flex items-center gap-2 font-medium">
            <Trophy className="h-4 w-4" />
            <span>
              {userAnswersCount}/{quiz.questions?.length || 0} completed
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const QuizResultsCard = ({
  result,
  quiz,
}: {
  result: SubmitQuizResult;
  quiz: Quiz;
}) => {
  const percentage = Math.round(result.percentage);
  const scoreColor =
    percentage >= 80
      ? "text-green-600"
      : percentage >= 60
        ? "text-yellow-600"
        : "text-red-600";
  const successMessage =
    percentage >= 80
      ? "Excellent work!"
      : percentage >= 60
        ? "Good job!"
        : "Keep practicing!";

  return (
    <Card className="border-primary/20 from-primary/10 to-primary/5 mb-8 bg-gradient-to-r">
      <CardContent className="pt-6 text-center">
        <Trophy className="text-primary mx-auto mb-4 h-16 w-16" />
        <h2 className="text-primary mb-2 text-3xl font-bold">
          Quiz Completed!
        </h2>
        <div className="space-y-2">
          <p className={`text-2xl font-bold ${scoreColor}`}>
            {result.score} / {quiz.questions?.length || 0}
          </p>
          <p className={`text-lg font-semibold ${scoreColor}`}>
            {percentage}% Score
          </p>
          <p className="text-muted-foreground text-xs">
            Attempt ID: <span className="font-mono">{result.attemptId}</span>
          </p>
          <p className="text-muted-foreground text-xs">
            Completed at: {new Date(result.completedAt).toLocaleString()}
          </p>
          <p className={`font-medium ${scoreColor}`}>{successMessage}</p>
        </div>
      </CardContent>
    </Card>
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
    <Card
      className={cn(
        "border-1 shadow-sm transition-all duration-200",
        !isSubmitted && "border-muted-foreground/20",
        !isSubmitted && isAnswered && "border-primary/30",
        isSubmitted && isCorrect && "border-green-500 bg-green-500/5",
        isSubmitted && isIncorrect && "border-red-500 bg-red-500/5",
        isSubmitted && !isAnswered && "border-primary/30",
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg leading-relaxed">
            <span className="text-primary mr-3 font-bold">{index + 1}.</span>
            {question.question_text}
          </CardTitle>
          {isSubmitted && (
            <div className="flex flex-shrink-0 items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Badge className="bg-green-600 text-xs text-white">
                    Correct
                  </Badge>
                </>
              ) : isIncorrect ? (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <Badge variant="destructive" className="text-xs">
                    Incorrect
                  </Badge>
                </>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Unanswered
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex min-h-[28px] items-center">
          <AnimatePresence>
            {!isSubmitted && isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <Badge className="bg-primary flex items-center gap-1 text-xs text-white">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Answered
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <RadioGroup
          value={userAnswer || ""}
          onValueChange={(value) => onAnswerChange(question.id, value)}
          disabled={isSubmitted}
          className="space-y-3"
        >
          {question.question_options
            ?.sort(
              (a: QuestionOption, b: QuestionOption) =>
                a.order_index - b.order_index,
            )
            .map((option: QuestionOption) => {
              const isSelected = userAnswer === option.id;
              const isCorrectOption =
                option.id === questionResult?.correctOptionId;

              return (
                <div
                  key={option.id}
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
                          "border-muted bg-muted/30 text-muted-foreground":
                            !isSelected && !isCorrectOption,
                        }
                      : {
                          "border-primary bg-primary/10 text-primary scale-[1.02] transform shadow-md":
                            isSelected,
                          "border-muted hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm":
                            !isSelected,
                        },
                  )}
                >
                  <div className="flex items-center gap-4">
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      disabled={isSubmitted}
                    />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer text-base font-medium"
                    >
                      {option.option_text}
                    </Label>
                    {isSubmitted && (
                      <>
                        {isCorrectOption && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {isSelected && !isCorrectOption && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default function QuizPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<SubmitQuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const canSubmit = useMemo(() => {
    if (!quiz?.questions) return false;
    return quiz.questions.every((question) => userAnswers[question.id]);
  }, [quiz?.questions, userAnswers]);

  const renderContent = () => {
    if (isLoading) return <QuizLoadingSkeleton />;
    if (error) return <QuizError />;
    if (!quiz) return null;

    return (
      <div className="from-primary/5 to-background min-h-screen bg-gradient-to-br">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <QuizHeader
            quiz={quiz}
            isSubmitted={isSubmitted}
            userAnswersCount={Object.keys(userAnswers).length}
          />

          {isSubmitted && result && (
            <QuizResultsCard result={result} quiz={quiz} />
          )}

          <div className="space-y-8">
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
          </div>

          <div className="mt-20 mb-32 space-y-4 text-center">
            {!isSubmitted ? (
              <>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  size="lg"
                  className="px-18 py-3 font-semibold"
                >
                  <Loader2
                    className={cn(
                      "mr-2 h-4 w-4 animate-spin",
                      !isSubmitting && "hidden",
                    )}
                  />
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
                {!canSubmit && (
                  <p className="text-muted-foreground text-sm">
                    Please answer all questions before submitting
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={handleRetake}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Retake Quiz
                </Button>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/quizzes">
                    <Button variant="ghost">Browse More Quizzes</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return <ProtectedRouteGuard>{renderContent()}</ProtectedRouteGuard>;
}
