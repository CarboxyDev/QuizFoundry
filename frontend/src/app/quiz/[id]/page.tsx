"use client";

import { ProtectedRouteGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuizById, submitQuiz, type SubmitQuizResult } from "@/lib/quiz-api";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, Clock, Trophy, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type UserAnswers = Record<string, string>;

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
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

  const handleAnswerChange = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
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
      // TODO: show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScorePercentage = () => {
    if (!result) return 0;
    return Math.round(result.percentage);
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
      </ProtectedRouteGuard>
    );
  }

  if (error) {
    return (
      <ProtectedRouteGuard>
        <div className="from-primary/5 to-background flex min-h-screen items-center justify-center bg-gradient-to-br">
          <Card className="mx-4 w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
              <h2 className="mb-3 text-2xl font-bold">Quiz Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The quiz you&apos;re looking for doesn&apos;t exist or you
                don&apos;t have access to it.
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
      <div className="from-primary/5 to-background min-h-screen bg-gradient-to-br">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between">
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
                <Badge
                  className={`text-sm capitalize ${quiz.difficulty === "easy" ? "border border-green-400 bg-green-100 text-green-700" : ""} ${quiz.difficulty === "medium" ? "border border-yellow-400 bg-yellow-100 text-yellow-800" : ""} ${quiz.difficulty === "hard" ? "border border-red-400 bg-red-100 text-red-700" : ""} `}
                >
                  {quiz.difficulty}
                </Badge>
              </div>

              {quiz.description && (
                <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                  {quiz.description}
                </p>
              )}

              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="text-primary h-4 w-4" />
                  <span>{quiz.questions?.length || 0} questions</span>
                </div>
                {quiz.is_ai_generated && (
                  <Badge variant="outline" className="text-xs">
                    AI Generated
                  </Badge>
                )}
                {!isSubmitted && (
                  <div className="text-primary flex items-center gap-2 font-medium">
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
          {isSubmitted && result && (
            <Card className="border-primary/20 from-primary/10 to-primary/5 mb-8 bg-gradient-to-r">
              <CardContent className="pt-6 text-center">
                <Trophy className="text-primary mx-auto mb-4 h-16 w-16" />
                <h2 className="text-primary mb-2 text-3xl font-bold">
                  Quiz Completed!
                </h2>
                <div className="space-y-2">
                  <p className={`text-2xl font-bold ${getScoreColor()}`}>
                    {result.score} / {quiz.questions?.length || 0}
                  </p>
                  <p className={`text-lg font-semibold ${getScoreColor()}`}>
                    {getScorePercentage()}% Score
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Attempt ID:{" "}
                    <span className="font-mono">{result.attemptId}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Completed at:{" "}
                    {new Date(result.completedAt).toLocaleString()}
                  </p>
                  {getScorePercentage() >= 80 && (
                    <p className="text-primary font-medium">
                      Excellent work! 🎉
                    </p>
                  )}
                  {getScorePercentage() >= 60 && getScorePercentage() < 80 && (
                    <p className="font-medium text-yellow-600">Good job! 👍</p>
                  )}
                  {getScorePercentage() < 60 && (
                    <p className="font-medium text-red-600">
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
              const isAnswered = !!selectedOptionId;
              let isCorrect = false;
              let isIncorrect = false;
              let correctOptionId: string | null = null;
              if (isSubmitted && result) {
                const qResult = result.results.find(
                  (r) => r.questionId === question.id,
                );
                isCorrect = qResult?.isCorrect ?? false;
                isIncorrect = !isCorrect && qResult?.selectedOptionId != null;
                correctOptionId = qResult?.correctOptionId ?? null;
              }

              let cardBorder = "border-primary/30";
              let cardBg = "";
              if (isSubmitted) {
                if (isCorrect) {
                  cardBorder = "border-green-500";
                  cardBg = "bg-green-500/5";
                } else if (isIncorrect) {
                  cardBorder = "border-red-500";
                  cardBg = "bg-red-500/5";
                }
              }

              return (
                <Card
                  key={question.id}
                  className={`border-1 shadow-sm transition-all duration-200 ${cardBorder} ${cardBg} ${!isSubmitted ? "hover:border-primary/60" : ""}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg leading-relaxed">
                        <span className="text-primary mr-3 font-bold">
                          {index + 1}.
                        </span>
                        {question.question_text}
                      </CardTitle>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        {isSubmitted ? (
                          isCorrect ? (
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
                          )
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Answered badge below question, always occupies space */}
                    <div className="mb-2 flex min-h-[28px] items-center">
                      <Badge
                        className="bg-primary flex items-center gap-1 text-xs text-white transition-opacity duration-200"
                        style={{
                          visibility: isAnswered ? "visible" : "hidden",
                        }}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Answered
                      </Badge>
                    </div>
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
                          let optionClasses =
                            "group relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ";
                          if (isSubmitted && result) {
                            if (option.id === correctOptionId) {
                              optionClasses +=
                                "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300";
                            } else if (
                              isSelected &&
                              option.id !== correctOptionId
                            ) {
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
                                  className="flex-1 cursor-pointer text-base font-medium"
                                >
                                  {option.option_text}
                                </Label>
                                {isSubmitted && result && (
                                  <>
                                    {option.id === correctOptionId && (
                                      <CheckCircle className="h-5 w-5 text-green-600" />
                                    )}
                                    {isSelected &&
                                      option.id !== correctOptionId && (
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
          <div className="mt-12 space-y-4 text-center">
            {!isSubmitted ? (
              <>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit() || isSubmitting}
                  size="lg"
                  className="px-12 py-3 text-lg font-semibold"
                >
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
                {!canSubmit() && (
                  <p className="text-muted-foreground text-sm">
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
                    setResult(null);
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRouteGuard>
  );
}
