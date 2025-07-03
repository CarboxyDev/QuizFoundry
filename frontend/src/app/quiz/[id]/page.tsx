"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getQuizById, type Quiz, type QuestionOption } from "@/lib/quiz-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { ProtectedRouteGuard } from "@/components/AuthGuard";

type UserAnswers = Record<string, string>; // questionId -> selectedOptionId

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
      const selectedOption = question.options?.find(
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-8" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-4 w-3/4" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ProtectedRouteGuard>
    );
  }

  if (error) {
    return (
      <ProtectedRouteGuard>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
                <p className="text-muted-foreground mb-4">
                  The quiz you're looking for doesn't exist or you don't have
                  access to it.
                </p>
                <Button onClick={() => router.push("/dashboard")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
            <Badge variant="secondary" className="capitalize">
              {quiz.difficulty}
            </Badge>
          </div>

          {quiz.description && (
            <p className="text-muted-foreground text-lg">{quiz.description}</p>
          )}

          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>{quiz.questions?.length || 0} questions</span>
            {quiz.is_ai_generated && <span>AI Generated</span>}
          </div>
        </div>

        {/* Results Summary */}
        {isSubmitted && score !== null && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
                <p className={`text-xl font-semibold ${getScoreColor()}`}>
                  You scored {score} out of {quiz.questions?.length || 0} (
                  {getScorePercentage()}%)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions?.map((question, index) => {
            const selectedOptionId = userAnswers[question.id];
            const selectedOption = question.options?.find(
              (opt) => opt.id === selectedOptionId
            );

            return (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    {index + 1}. {question.question_text}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedOptionId || ""}
                    onValueChange={(value) =>
                      handleAnswerChange(question.id, value)
                    }
                    disabled={isSubmitted}
                  >
                    <div className="space-y-3">
                      {question.options
                        ?.sort((a, b) => a.order_index - b.order_index)
                        .map((option) => {
                          const isSelected = selectedOptionId === option.id;
                          const isCorrect = option.is_correct;
                          const shouldHighlight =
                            isSubmitted && (isSelected || isCorrect);

                          let optionStyle = "";
                          if (isSubmitted) {
                            if (isCorrect) {
                              optionStyle =
                                "border-green-500 bg-green-50 text-green-700";
                            } else if (isSelected && !isCorrect) {
                              optionStyle =
                                "border-red-500 bg-red-50 text-red-700";
                            }
                          }

                          return (
                            <div
                              key={option.id}
                              className={`flex items-center space-x-3 p-3 rounded-md border transition-colors ${optionStyle}`}
                            >
                              <RadioGroupItem
                                value={option.id}
                                id={option.id}
                                disabled={isSubmitted}
                              />
                              <Label
                                htmlFor={option.id}
                                className="flex-1 cursor-pointer"
                              >
                                {option.option_text}
                              </Label>
                              {isSubmitted && isCorrect && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                              {isSubmitted && isSelected && !isCorrect && (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="mt-8 text-center">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit()}
              size="lg"
              className="px-8"
            >
              Submit Quiz
            </Button>
            {!canSubmit() && (
              <p className="text-sm text-muted-foreground mt-2">
                Please answer all questions before submitting
              </p>
            )}
          </div>
        )}

        {/* Retake Option */}
        {isSubmitted && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => {
                setUserAnswers({});
                setIsSubmitted(false);
                setScore(null);
              }}
              variant="outline"
              size="lg"
              className="px-8"
            >
              Retake Quiz
            </Button>
          </div>
        )}
      </div>
    </ProtectedRouteGuard>
  );
}
