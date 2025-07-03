"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getQuizById,
  type Quiz,
  type Question,
  type QuestionOption,
} from "@/lib/quiz-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Trophy,
} from "lucide-react";
import { ProtectedRouteGuard } from "@/components/AuthGuard";
import Link from "next/link";

type UserAnswers = Record<string, string>;

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const {
    data: quiz,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuizById(quizId),
    enabled: !!quizId,
  });

  const handleAnswerChange = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = () => {
    if (!quiz?.questions) return;

    let correctCount = 0;
    quiz.questions.forEach((question) => {
      const selectedOptionId = userAnswers[question.id];
      const selectedOption = question.question_options?.find(
        (opt) => opt.id === selectedOptionId
      );
      if (selectedOption?.is_correct) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setIsSubmitted(true);
  };

  const getScorePercentage = () => {
    if (score === null || !quiz?.questions) return 0;
    return Math.round((score / quiz.questions.length) * 100);
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const canSubmit = () => {
    if (!quiz?.questions) return false;
    return quiz.questions.every((question) => userAnswers[question.id]);
  };

  if (isLoading) {
    return (
      <ProtectedRouteGuard>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-full" />
              </div>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-full mb-6" />
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
      </ProtectedRouteGuard>
    );
  }

  if (error) {
    return (
      <ProtectedRouteGuard>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Quiz Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The quiz you're looking for doesn't exist or you don't have
                access to it.
              </p>
              <Link href="/quizzes">
                <Button className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Browse More Quizzes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProtectedRouteGuard>
    );
  }

  if (!quiz) {
    return (
      <ProtectedRouteGuard>
        <div></div>
      </ProtectedRouteGuard>
    );
  }

  return (
    <ProtectedRouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Link href="/quizzes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Browse More Quizzes
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </Button>
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {quiz.title}
                </h1>
                <Badge variant="secondary" className="capitalize text-sm">
                  {quiz.difficulty}
                </Badge>
              </div>

              {quiz.description && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {quiz.description}
                </p>
              )}

              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{quiz.questions?.length || 0} questions</span>
                </div>
                {quiz.is_ai_generated && (
                  <Badge variant="outline" className="text-xs">
                    AI Generated
                  </Badge>
                )}
                {!isSubmitted && (
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Trophy className="h-4 w-4" />
                    <span>
                      {Object.keys(userAnswers).length}/
                      {quiz.questions?.length || 0} completed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {isSubmitted && score !== null && (
            <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="pt-6 text-center">
                <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2 text-primary">
                  Quiz Completed!
                </h2>
                <div className="space-y-2">
                  <p className={`text-2xl font-bold ${getScoreColor()}`}>
                    {score} / {quiz.questions?.length || 0}
                  </p>
                  <p className={`text-lg font-semibold ${getScoreColor()}`}>
                    {getScorePercentage()}% Score
                  </p>
                  {getScorePercentage() >= 80 && (
                    <p className="text-primary font-medium">
                      Excellent work! 🎉
                    </p>
                  )}
                  {getScorePercentage() >= 60 && getScorePercentage() < 80 && (
                    <p className="text-yellow-600 font-medium">Good job! 👍</p>
                  )}
                  {getScorePercentage() < 60 && (
                    <p className="text-red-600 font-medium">
                      Keep practicing! 💪
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions */}
          <div className="space-y-8">
            {quiz.questions?.map((question, index) => {
              const selectedOptionId = userAnswers[question.id];
              const selectedOption = question.question_options?.find(
                (opt) => opt.id === selectedOptionId
              );
              const isAnswered = !!selectedOptionId;
              const isCorrect = isSubmitted && selectedOption?.is_correct;
              const isIncorrect =
                isSubmitted && selectedOptionId && !selectedOption?.is_correct;

              return (
                <Card
                  key={question.id}
                  className={`transition-all duration-200 ${
                    isSubmitted
                      ? isCorrect
                        ? "border-green-500/50 bg-green-500/5"
                        : isIncorrect
                          ? "border-red-500/50 bg-red-500/5"
                          : "border-muted"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg leading-relaxed">
                        <span className="text-primary font-bold mr-3">
                          {index + 1}.
                        </span>
                        {question.question_text}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isSubmitted ? (
                          isCorrect ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <Badge className="bg-green-600 text-white text-xs">
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
                          )
                        ) : isAnswered ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <Badge className="bg-primary text-white text-xs">
                              Answered
                            </Badge>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={selectedOptionId || ""}
                      onValueChange={(value) =>
                        handleAnswerChange(question.id, value)
                      }
                      disabled={isSubmitted}
                      className="space-y-3"
                    >
                      {question.question_options
                        ?.sort((a, b) => a.order_index - b.order_index)
                        .map((option) => {
                          const isSelected = selectedOptionId === option.id;
                          const isCorrectOption = option.is_correct;

                          let optionClasses =
                            "group relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ";

                          if (isSubmitted) {
                            if (isCorrectOption) {
                              optionClasses +=
                                "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300";
                            } else if (isSelected && !isCorrectOption) {
                              optionClasses +=
                                "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
                            } else {
                              optionClasses +=
                                "border-muted bg-muted/30 text-muted-foreground";
                            }
                          } else {
                            if (isSelected) {
                              optionClasses +=
                                "border-primary bg-primary/10 text-primary shadow-md transform scale-[1.02]";
                            } else {
                              optionClasses +=
                                "border-muted hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm";
                            }
                          }

                          return (
                            <div
                              key={option.id}
                              className={optionClasses}
                              onClick={() => {
                                if (!isSubmitted) {
                                  handleAnswerChange(question.id, option.id);
                                }
                              }}
                            >
                              <div className="flex items-center gap-4">
                                <RadioGroupItem
                                  value={option.id}
                                  id={option.id}
                                  disabled={isSubmitted}
                                />

                                <Label
                                  htmlFor={option.id}
                                  className="font-medium text-base flex-1 cursor-pointer"
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
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-12 text-center space-y-4">
            {!isSubmitted ? (
              <>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit()}
                  size="lg"
                  className="px-12 py-3 text-lg font-semibold"
                >
                  Submit Quiz
                </Button>
                {!canSubmit() && (
                  <p className="text-sm text-muted-foreground">
                    Please answer all questions before submitting
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setUserAnswers({});
                    setIsSubmitted(false);
                    setScore(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
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
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRouteGuard>
  );
}
