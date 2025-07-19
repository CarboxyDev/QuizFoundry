"use client";

import { ProtectedRouteGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createQuizAdvanced,
  createQuizExpress,
  surpriseMe,
} from "@/lib/quiz-api";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Loader2, Lock, Sparkles, Wand2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface QuizFormData {
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  optionsCount: number;
  questionCount: number;
  isPublic: boolean;
  mode: "express" | "advanced";
}

export default function CreateQuizPage() {
  const [formData, setFormData] = useState<QuizFormData>({
    prompt: "",
    difficulty: "medium",
    optionsCount: 4,
    questionCount: 5,
    isPublic: true,
    mode: "express",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSurpriseLoading, setIsSurpriseLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleFormDataChange = (updates: Partial<QuizFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handlePromptChange = (prompt: string) => {
    setFormData((prev) => ({ ...prev, prompt }));
  };

  const handleGenerateQuiz = async () => {
    if (!formData.prompt.trim()) {
      toast.error("Please enter a quiz topic or description");
      return;
    }

    setIsGenerating(true);

    try {
      if (formData.mode === "express") {
        console.log("Generating quiz with Express Mode:", formData);

        const expressInput = {
          prompt: formData.prompt,
          difficulty: formData.difficulty,
          questionCount: formData.questionCount,
          optionsCount: formData.optionsCount,
          is_public: formData.isPublic,
        };
        const result = await createQuizExpress(expressInput);

        toast.success("Quiz generated successfully!");
        setShowSuccess(true);
        setIsGenerating(false);

        setTimeout(() => {
          router.push("/my-quizzes");
        }, 3000);
      } else {
        console.log("Generating quiz with Advanced Mode:", formData);

        const advancedInput = {
          prompt: formData.prompt,
          difficulty: formData.difficulty,
          questionCount: formData.questionCount,
          optionsCount: formData.optionsCount,
          is_public: formData.isPublic,
        };
        const result = await createQuizAdvanced(advancedInput);

        toast.success("Prototype quiz created successfully!");
        setShowSuccess(true);
        setIsGenerating(false);

        const prototypeData = {
          prototype: result.quiz,
          originalPrompt: result.originalPrompt,
          isPublic: formData.isPublic,
        };

        const searchParams = new URLSearchParams({
          data: JSON.stringify(prototypeData),
        });

        setTimeout(() => {
          router.push(`/create-quiz/advanced?${searchParams.toString()}`);
        }, 3000);
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSurpriseMe = async () => {
    setIsSurpriseLoading(true);

    try {
      const surprisePrompt = await surpriseMe();
      setFormData((prev) => ({ ...prev, prompt: surprisePrompt }));
      toast.success("Surprise! Your creative quiz prompt is ready!");
    } catch (error) {
      console.error("Error getting surprise prompt:", error);
      toast.error("Failed to generate surprise prompt. Please try again.");
    } finally {
      setIsSurpriseLoading(false);
    }
  };

  const canSubmit = formData.prompt.trim().length > 0;

  return (
    <ProtectedRouteGuard>
      <div className="from-background via-muted/10 to-background min-h-screen bg-gradient-to-br">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.08),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.02),transparent_50%)]" />

        <div className="relative z-10">
          <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-12 text-center"
            >
              <motion.div
                key={formData.mode}
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  duration: 0.6,
                }}
                className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-500 ${
                  formData.mode === "express"
                    ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 ring-1 ring-emerald-300/50 dark:from-emerald-900/30 dark:to-emerald-800/30 dark:text-emerald-300 dark:ring-emerald-500/30"
                    : "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 ring-1 ring-purple-300/50 dark:from-purple-900/30 dark:to-purple-800/30 dark:text-purple-300 dark:ring-purple-500/30"
                }`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={formData.mode}
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    exit={{ rotate: 90, scale: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      duration: 0.4,
                    }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate:
                          formData.mode === "express"
                            ? [0, 15, -15, 0]
                            : [0, -15, 15, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut",
                      }}
                    >
                      {formData.mode === "express" ? (
                        <Zap className="h-4 w-4" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="font-semibold"
                    >
                      {formData.mode === "express"
                        ? "Express Mode"
                        : "Advanced Mode"}
                    </motion.span>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
              <h1 className="mb-4 text-4xl font-bold">Create Your Quiz</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="relative mx-auto max-w-3xl overflow-hidden shadow-lg">
                {/* Animated Border Effect */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 rounded-lg"
                    >
                      {/* Single rotating beam */}
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: `conic-gradient(from 0deg, 
                            transparent 0%, 
                            transparent 85%, 
                            rgba(255, 125, 40, 0.3) 88%, 
                            rgba(255, 140, 70, 0.8) 92%, 
                            rgb(255, 125, 40) 95%, 
                            rgba(255, 140, 70, 0.8) 98%, 
                            rgba(255, 125, 40, 0.3) 100%)`,
                        }}
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />

                      {/* Inner content mask - preserves card background */}
                      <div className="bg-card absolute inset-[2px] rounded-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* <CardHeader className="relative z-20">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Quiz Configuration
                  </CardTitle>
                </CardHeader> */}
                <CardContent className="relative z-20 space-y-8">
                  {/* Quiz Prompt */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          htmlFor="prompt"
                          className="text-base font-semibold"
                        >
                          Quiz Topic
                        </Label>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Describe what you want your quiz to be about
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSurpriseMe}
                          disabled={isGenerating || isSurpriseLoading}
                          className="h-9 gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 shadow-sm transition-all duration-300 hover:border-purple-400 hover:from-purple-100 hover:to-pink-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:from-purple-900/20 dark:to-pink-900/20 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30"
                        >
                          {isSurpriseLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                Surprising...
                              </span>
                            </>
                          ) : (
                            <>
                              <motion.div
                                animate={{
                                  rotate: [0, 15, -15, 0],
                                  scale: [1, 1.1, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatDelay: 3,
                                }}
                              >
                                <Wand2 className="h-4 w-4 text-purple-600" />
                              </motion.div>
                              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                Surprise Me
                              </span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>

                    <Textarea
                      id="prompt"
                      placeholder="Example: History of the internet"
                      value={formData.prompt}
                      onChange={(e) => handlePromptChange(e.target.value)}
                      className="min-h-[120px] resize-none text-base"
                      disabled={isGenerating || isSurpriseLoading}
                    />

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        This will generate{" "}
                        <Badge variant="outline">
                          {formData.questionCount} questions
                        </Badge>{" "}
                        with{" "}
                        <Badge variant="outline">
                          {formData.optionsCount} options
                        </Badge>{" "}
                        each
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="difficulty"
                          className="text-sm font-medium"
                        >
                          Difficulty Level
                        </Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) =>
                            handleFormDataChange({
                              difficulty: value as "easy" | "medium" | "hard",
                            })
                          }
                          disabled={isGenerating}
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
                        <Label
                          htmlFor="questionCount"
                          className="text-sm font-medium"
                        >
                          Number of Questions
                        </Label>
                        <Select
                          value={formData.questionCount.toString()}
                          onValueChange={(value) =>
                            handleFormDataChange({
                              questionCount: parseInt(value),
                            })
                          }
                          disabled={isGenerating}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[3, 5, 7, 10, 15].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? "Question" : "Questions"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="optionsCount"
                          className="text-sm font-medium"
                        >
                          Options per Question
                        </Label>
                        <Select
                          value={formData.optionsCount.toString()}
                          onValueChange={(value) =>
                            handleFormDataChange({
                              optionsCount: parseInt(value),
                            })
                          }
                          disabled={isGenerating}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 4, 6, 8].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} Options
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="visibility-switch"
                          className="text-sm font-medium"
                        >
                          Quiz Visibility
                        </Label>
                        <div className="flex items-center justify-between rounded-md border px-3 py-2">
                          <div className="flex items-center gap-2">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={formData.isPublic ? "public" : "private"}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{
                                  duration: 0.2,
                                  ease: "easeInOut",
                                }}
                                className="flex items-center gap-2"
                              >
                                {formData.isPublic ? (
                                  <>
                                    <Globe className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm font-medium text-emerald-500">
                                      Public
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-4 w-4 text-red-500" />
                                    <span className="text-sm font-medium text-red-500">
                                      Private
                                    </span>
                                  </>
                                )}
                              </motion.div>
                            </AnimatePresence>
                          </div>
                          <Switch
                            id="visibility-switch"
                            checked={formData.isPublic}
                            onCheckedChange={(checked) =>
                              handleFormDataChange({ isPublic: checked })
                            }
                            disabled={isGenerating}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    {/* <div>
                      <Label className="text-base font-medium">
                        Generation Mode
                      </Label>
                    </div> */}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className={`relative cursor-pointer overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 ${
                            formData.mode === "express"
                              ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg ring-1 ring-emerald-200 dark:border-emerald-500 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:ring-emerald-500/20"
                              : "border-border bg-card hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
                          }`}
                          onClick={() =>
                            handleFormDataChange({ mode: "express" })
                          }
                        >
                          {formData.mode === "express" && (
                            <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-emerald-500 p-1">
                              <Sparkles className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-lg p-2 ${
                                formData.mode === "express"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                              }`}
                            >
                              <Zap className="h-6 w-6" />
                            </div>
                            <div>
                              <h3
                                className={`text-lg font-semibold ${
                                  formData.mode === "express"
                                    ? "text-emerald-900 dark:text-emerald-100"
                                    : "text-foreground"
                                }`}
                              >
                                Express Mode
                              </h3>
                              <p
                                className={`text-sm ${
                                  formData.mode === "express"
                                    ? "text-emerald-700 dark:text-emerald-300"
                                    : "text-muted-foreground"
                                }`}
                              >
                                Creates final quiz instantly
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className={`relative cursor-pointer overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 ${
                            formData.mode === "advanced"
                              ? "border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg ring-1 ring-purple-200 dark:border-purple-500 dark:from-purple-900/20 dark:to-purple-800/20 dark:ring-purple-500/20"
                              : "border-border bg-card hover:border-purple-200 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                          }`}
                          onClick={() =>
                            handleFormDataChange({ mode: "advanced" })
                          }
                        >
                          {formData.mode === "advanced" && (
                            <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-purple-500 p-1">
                              <Wand2 className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-lg p-2 ${
                                formData.mode === "advanced"
                                  ? "bg-purple-500 text-white"
                                  : "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
                              }`}
                            >
                              <Wand2 className="h-6 w-6" />
                            </div>
                            <div>
                              <h3
                                className={`text-lg font-semibold ${
                                  formData.mode === "advanced"
                                    ? "text-purple-900 dark:text-purple-100"
                                    : "text-foreground"
                                }`}
                              >
                                Advanced Mode
                              </h3>
                              <p
                                className={`text-sm ${
                                  formData.mode === "advanced"
                                    ? "text-purple-700 dark:text-purple-300"
                                    : "text-muted-foreground"
                                }`}
                              >
                                Creates AI prototype for editing
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Generate Buttons */}
                  <div className="space-y-3 pt-4">
                    <div className="flex justify-center">
                      <Button
                        onClick={handleGenerateQuiz}
                        disabled={!canSubmit || isGenerating}
                        className="h-14 w-full max-w-md gap-2 text-lg font-medium"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            {formData.mode === "express"
                              ? "Generating..."
                              : "Creating..."}
                          </>
                        ) : (
                          <>
                            {formData.mode === "express" ? (
                              <>
                                <Sparkles className="h-6 w-6" />
                                Generate Quiz
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-6 w-6" />
                                Create Prototype
                              </>
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Success Overlay */}
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
                className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent"
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
                    className="bg-primary/10 ring-primary/20 flex items-center justify-center rounded-full p-6 ring-1"
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
                      {formData.mode === "express" ? (
                        <Zap className="text-primary h-16 w-16" />
                      ) : (
                        <Wand2 className="text-primary h-16 w-16" />
                      )}
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
                  <h2 className="text-foreground text-4xl font-bold">
                    {formData.mode === "express"
                      ? "Quiz Created Successfully!"
                      : "Prototype Quiz Created Successfully!"}
                  </h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-muted-foreground text-lg font-medium"
                  >
                    {formData.mode === "express"
                      ? "Your quiz is ready to share and take"
                      : "Your quiz is ready to edit and customize"}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="text-muted-foreground mt-4 flex items-center justify-center gap-2 text-sm"
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
                    {formData.mode === "express"
                      ? "Redirecting to your quizzes..."
                      : "Redirecting to the quiz editor..."}
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
