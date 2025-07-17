"use client";

import { ProtectedRouteGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enhancedToastError } from "@/components/ui/enhanced-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getQuizByIdForPreview, updateQuizWithQuestions } from "@/lib/quiz-api";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle,
  Edit3,
  Globe,
  Loader2,
  Lock,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface EditableQuestion {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "short_answer";
  order_index: number;
  options: Array<{
    id: string;
    option_text: string;
    is_correct: boolean;
    order_index: number;
  }>;
}

interface EditableQuiz {
  id: string;
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
  is_public: boolean;
  questions: EditableQuestion[];
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  hover: { y: -2 },
};

const StickyEditHeader = ({
  show,
  quiz,
  isSaving,
  onSave,
}: {
  show: boolean;
  quiz: EditableQuiz | null;
  isSaving: boolean;
  onSave: () => void;
}) => {
  const questionCount = quiz?.questions.length || 0;

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
          <div className="bg-background/80 pointer-events-auto mx-auto w-full max-w-4xl rounded-b-xl border-x border-b px-6 py-3 shadow-lg backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <Link href="/my-quizzes">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>

              <div className="flex items-center gap-4">
                <h3 className="line-clamp-1 max-w-[200px] font-semibold xl:max-w-[400px] 2xl:max-w-[500px]">
                  {quiz?.title || "Untitled Quiz"}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary rounded-full px-3 py-1"
                >
                  <Edit3 className="mr-1 h-3 w-3" />
                  {questionCount} questions
                </Badge>
              </div>

              <Button
                onClick={onSave}
                disabled={isSaving}
                size="sm"
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EditQuizLoadingSkeleton = () => (
  <div className="from-background via-muted/10 to-background min-h-screen bg-gradient-to-br">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.08),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.02),transparent_50%)]" />

    <div className="relative z-10 container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* Quiz settings skeleton */}
        <div className="mb-8">
          <div className="bg-background/80 rounded-xl border p-6 shadow-lg backdrop-blur-sm">
            <div className="mb-6">
              <Skeleton className="h-6 w-32 rounded-lg" />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions section skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-36 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          {/* Question skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative">
              <div className="bg-background/80 rounded-xl border-2 p-6 shadow-lg backdrop-blur-sm">
                <div className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-6 w-24 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>

                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((j) => (
                        <div
                          key={j}
                          className="flex items-center gap-3 rounded-lg border-2 p-3"
                        >
                          <Skeleton className="h-5 w-5 rounded-full" />
                          <Skeleton className="h-10 flex-1 rounded-lg" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizid as string;
  const queryClient = useQueryClient();

  const [quiz, setQuiz] = useState<EditableQuiz | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const headerRef = useRef<HTMLDivElement | null>(null);

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
    data: previewQuiz,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["quiz-preview", quizId],
    queryFn: () => getQuizByIdForPreview(quizId),
    enabled: !!quizId,
  });

  useEffect(() => {
    if (!previewQuiz) return;

    const editableQuiz: EditableQuiz = {
      id: previewQuiz.id,
      title: previewQuiz.title,
      description: previewQuiz.description,
      difficulty: previewQuiz.difficulty,
      is_public: previewQuiz.is_public,
      questions:
        previewQuiz.questions?.map((q, index) => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          order_index: index,
          options:
            q.question_options?.map((opt, optIndex) => ({
              id: opt.id,
              option_text: opt.option_text,
              is_correct: opt.is_correct,
              order_index: optIndex,
            })) || [],
        })) || [],
    };

    setQuiz(editableQuiz);
  }, [previewQuiz]);

  // Handle potential fetch error
  useEffect(() => {
    if (fetchError) {
      console.error("Error loading quiz:", fetchError);
      enhancedToastError("Failed to load quiz data");
      router.push("/my-quizzes");
    }
  }, [fetchError, router]);

  const updateQuiz = (updates: Partial<EditableQuiz>) => {
    setQuiz((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updateQuestion = (
    questionId: string,
    updates: Partial<EditableQuestion>,
  ) => {
    setQuiz((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q,
        ),
      };
    });
  };

  const updateOption = (
    questionId: string,
    optionId: string,
    updates: { option_text?: string; is_correct?: boolean },
  ) => {
    setQuiz((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                options: q.options.map((opt) =>
                  opt.id === optionId ? { ...opt, ...updates } : opt,
                ),
              }
            : q,
        ),
      };
    });
  };

  const addQuestion = () => {
    if (!quiz) return;

    const newQuestion: EditableQuestion = {
      id: `question-${Date.now()}`,
      question_text: "",
      question_type: "multiple_choice",
      order_index: quiz.questions.length,
      options: [
        {
          id: `option-${Date.now()}-0`,
          option_text: "",
          is_correct: true,
          order_index: 0,
        },
        {
          id: `option-${Date.now()}-1`,
          option_text: "",
          is_correct: false,
          order_index: 1,
        },
      ],
    };

    setQuiz((prev) =>
      prev ? { ...prev, questions: [...prev.questions, newQuestion] } : null,
    );
  };

  const removeQuestion = (questionId: string) => {
    setQuiz((prev) => {
      if (!prev) return null;
      const filteredQuestions = prev.questions
        .filter((q) => q.id !== questionId)
        .map((q, index) => ({ ...q, order_index: index }));
      return { ...prev, questions: filteredQuestions };
    });
  };

  const moveQuestion = (questionId: string, direction: "up" | "down") => {
    if (!quiz) return;

    const currentIndex = quiz.questions.findIndex((q) => q.id === questionId);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= quiz.questions.length) return;

    const newQuestions = [...quiz.questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[currentIndex],
    ];

    // Update order indices
    newQuestions.forEach((q, index) => {
      q.order_index = index;
    });

    setQuiz((prev) => (prev ? { ...prev, questions: newQuestions } : null));
  };

  const addOption = (questionId: string) => {
    const question = quiz?.questions.find((q) => q.id === questionId);
    if (!question) return;

    const newOption = {
      id: `option-${Date.now()}`,
      option_text: "",
      is_correct: false,
      order_index: question.options.length,
    };

    updateQuestion(questionId, {
      options: [...question.options, newOption],
    });
  };

  const removeOption = (questionId: string, optionId: string) => {
    const question = quiz?.questions.find((q) => q.id === questionId);
    if (!question || question.options.length <= 2) return;

    const filteredOptions = question.options
      .filter((opt) => opt.id !== optionId)
      .map((opt, index) => ({ ...opt, order_index: index }));

    updateQuestion(questionId, { options: filteredOptions });
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    const question = quiz?.questions.find((q) => q.id === questionId);
    if (!question) return;

    const updatedOptions = question.options.map((opt) => ({
      ...opt,
      is_correct: opt.id === optionId,
    }));

    updateQuestion(questionId, { options: updatedOptions });
  };

  const handleSave = async () => {
    if (!quiz) return;

    // Validate quiz data
    if (!quiz.title.trim()) {
      toast.error("Quiz title is required");
      return;
    }

    if (quiz.title.trim().length < 3) {
      toast.error("Quiz title must be at least 3 characters");
      return;
    }

    if (quiz.title.trim().length > 200) {
      toast.error("Quiz title must be less than 200 characters");
      return;
    }

    if (quiz.description && quiz.description.trim().length > 1000) {
      toast.error("Quiz description must be less than 1000 characters");
      return;
    }

    if (quiz.questions.length === 0) {
      toast.error("Quiz must have at least one question");
      return;
    }

    if (quiz.questions.length > 20) {
      toast.error("Quiz cannot have more than 20 questions");
      return;
    }

    for (const [index, question] of quiz.questions.entries()) {
      if (!question.question_text.trim()) {
        toast.error(`Question ${index + 1} text is required`);
        return;
      }

      if (question.question_text.trim().length < 10) {
        toast.error(`Question ${index + 1} must be at least 10 characters`);
        return;
      }

      if (question.question_text.trim().length > 500) {
        toast.error(`Question ${index + 1} must be less than 500 characters`);
        return;
      }

      if (question.options.length < 2) {
        toast.error(`Question ${index + 1} must have at least 2 options`);
        return;
      }

      if (question.options.length > 8) {
        toast.error(`Question ${index + 1} cannot have more than 8 options`);
        return;
      }

      if (!question.options.some((opt) => opt.is_correct)) {
        toast.error(`Question ${index + 1} must have a correct answer`);
        return;
      }

      const correctOptions = question.options.filter((opt) => opt.is_correct);
      if (correctOptions.length > 1) {
        toast.error(
          `Question ${index + 1} must have exactly one correct answer`,
        );
        return;
      }

      for (const [optIndex, option] of question.options.entries()) {
        if (!option.option_text.trim()) {
          toast.error(
            `Question ${index + 1}, Option ${optIndex + 1} text is required`,
          );
          return;
        }

        if (option.option_text.trim().length > 200) {
          toast.error(
            `Question ${index + 1}, Option ${optIndex + 1} must be less than 200 characters`,
          );
          return;
        }
      }
    }

    setIsSaving(true);

    try {
      await updateQuizWithQuestions(quiz.id, {
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        is_public: quiz.is_public,
        questions: quiz.questions.map((q) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          order_index: q.order_index,
          options: q.options.map((opt) => ({
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            order_index: opt.order_index,
          })),
        })),
      });

      toast.success("Quiz updated successfully!");
      
      // Clear the query cache for this quiz to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["quiz-preview", quizId] });
      
      setShowSuccess(true);

      setTimeout(() => {
        router.push("/my-quizzes");
      }, 3500);
    } catch (error) {
      console.error("Error saving quiz:", error);
      enhancedToastError(error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRouteGuard>
        <EditQuizLoadingSkeleton />
      </ProtectedRouteGuard>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Quiz not found</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRouteGuard>
      <StickyEditHeader
        show={showStickyHeader}
        quiz={quiz}
        isSaving={isSaving}
        onSave={handleSave}
      />

      <div className="from-background via-muted/10 to-background min-h-screen bg-gradient-to-br">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.08),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.02),transparent_50%)]" />

        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={pageVariants}
            className="mx-auto max-w-4xl"
          >
            <div
              ref={headerRef}
              className="mb-8 flex items-center justify-between"
            >
              <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
                <Link href="/my-quizzes">
                  <Button variant="ghost" className="hover:bg-accent">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to My Quizzes
                  </Button>
                </Link>
              </motion.div>

              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                >
                  <Edit3 className="mr-1 h-3 w-3" />
                  Edit Mode
                </Badge>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>

            <motion.div variants={cardVariants} className="mb-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5" />
                    Quiz Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title</Label>
                    <Input
                      id="title"
                      value={quiz.title}
                      onChange={(e) => updateQuiz({ title: e.target.value })}
                      placeholder="Enter quiz title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={quiz.description || ""}
                      onChange={(e) =>
                        updateQuiz({ description: e.target.value })
                      }
                      placeholder="Enter quiz description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={quiz.difficulty}
                        onValueChange={(value) =>
                          updateQuiz({
                            difficulty: value as "easy" | "medium" | "hard",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              Easy
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-yellow-500" />
                              Medium
                            </div>
                          </SelectItem>
                          <SelectItem value="hard">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-500" />
                              Hard
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          {quiz.is_public ? (
                            <>
                              <Globe className="h-4 w-4 text-emerald-500" />
                              <span className="text-sm font-medium">
                                Public
                              </span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium">
                                Private
                              </span>
                            </>
                          )}
                        </div>
                        <Switch
                          checked={quiz.is_public}
                          onCheckedChange={(checked) =>
                            updateQuiz({ is_public: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Questions ({quiz.questions.length})
                </h2>
                <Button onClick={addQuestion} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </div>

              <AnimatePresence>
                {quiz.questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    index={index}
                    total={quiz.questions.length}
                    onUpdate={(updates) => updateQuestion(question.id, updates)}
                    onUpdateOption={(optionId, updates) =>
                      updateOption(question.id, optionId, updates)
                    }
                    onAddOption={() => addOption(question.id)}
                    onRemoveOption={(optionId) =>
                      removeOption(question.id, optionId)
                    }
                    onSetCorrectOption={(optionId) =>
                      setCorrectOption(question.id, optionId)
                    }
                    onRemove={() => removeQuestion(question.id)}
                    onMove={(direction) => moveQuestion(question.id, direction)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              key="successOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            >
              {/* Background Mask */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />

              {/* Subtle Gradient Effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                }}
                className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
              />

              {/* Main Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 15,
                    delay: 0.3,
                  }}
                  className="relative mb-6"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center rounded-full bg-primary/10 p-6 ring-1 ring-primary/20"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <CheckCircle className="h-16 w-16 text-primary" />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Success Text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <h2 className="text-4xl font-bold text-foreground">
                    Quiz Updated Successfully!
                  </h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-lg font-medium text-muted-foreground"
                  >
                    Your quiz changes have been saved and applied.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="h-4 w-4" />
                    </motion.div>
                    Redirecting to My Quizzes...
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRouteGuard>
  );
}

interface QuestionEditorProps {
  question: EditableQuestion;
  index: number;
  total: number;
  onUpdate: (updates: Partial<EditableQuestion>) => void;
  onUpdateOption: (
    optionId: string,
    updates: { option_text?: string; is_correct?: boolean },
  ) => void;
  onAddOption: () => void;
  onRemoveOption: (optionId: string) => void;
  onSetCorrectOption: (optionId: string) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
}

function QuestionEditor({
  question,
  index,
  total,
  onUpdate,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onSetCorrectOption,
  onRemove,
  onMove,
}: QuestionEditorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      variants={cardVariants}
      whileHover="hover"
      className="relative"
    >
      <Card className="border-border/50 hover:border-primary/30 border-2 shadow-lg transition-all duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <Label
                  htmlFor={`question-${question.id}`}
                  className="text-base font-semibold"
                >
                  Question {index + 1}
                </Label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMove("up")}
                disabled={index === 0}
                className="h-8 w-8 p-0"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMove("down")}
                disabled={index === total - 1}
                className="h-8 w-8 p-0"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={`question-${question.id}`}>Question Text</Label>
            <Textarea
              id={`question-${question.id}`}
              value={question.question_text}
              onChange={(e) => onUpdate({ question_text: e.target.value })}
              placeholder="Enter your question"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddOption}
                className="gap-2"
                disabled={question.options.length >= 8}
              >
                <Plus className="h-3 w-3" />
                Add Option
              </Button>
            </div>

            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border-2 p-3 transition-all duration-200",
                    option.is_correct
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSetCorrectOption(option.id)}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                      option.is_correct
                        ? "border-green-500 bg-green-500"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    {option.is_correct && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </button>

                  <Input
                    value={option.option_text}
                    onChange={(e) =>
                      onUpdateOption(option.id, { option_text: e.target.value })
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                    className="flex-1"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveOption(option.id)}
                    disabled={question.options.length <= 2}
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
