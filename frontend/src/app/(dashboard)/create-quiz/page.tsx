"use client";

import { ProtectedRouteGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12 text-center"
            >
              <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                AI Quiz Generator
              </div>
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

                <CardHeader className="relative z-20">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Quiz Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-20 space-y-8">
                  {/* Quiz Prompt */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          htmlFor="prompt"
                          className="text-base font-medium"
                        >
                          Quiz Topic
                        </Label>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Describe what you want your quiz to be about
                        </p>
                      </div>
                      {/* Surprise Me Button (moved above textarea, right-aligned) */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSurpriseMe}
                          disabled={isGenerating || isSurpriseLoading}
                          className="h-8 gap-2 border-purple-200 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-3 transition-all duration-300 hover:border-purple-300 hover:from-purple-500/20 hover:to-pink-500/20"
                        >
                          {isSurpriseLoading ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span className="text-xs font-medium">
                                Generating...
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
                                <Wand2 className="h-3 w-3 text-purple-600" />
                              </motion.div>
                              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xs font-medium text-transparent">
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
                      <div className="text-muted-foreground">
                        {formData.prompt.length} characters
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
                            {[3, 5, 7, 10, 15, 20].map((num) => (
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
                                transition={{ duration: 0.2, ease: "easeInOut" }}
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

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          variant={
                            formData.mode === "express" ? "default" : "outline"
                          }
                          className={`h-20 w-full flex-col gap-2 text-left ${
                            formData.mode === "express"
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() =>
                            handleFormDataChange({ mode: "express" })
                          }
                          disabled={isGenerating}
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            <span className="font-semibold">Express Mode</span>
                          </div>
                          <span className="text-xs opacity-80">
                            Creates final quiz instantly
                          </span>
                        </Button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          variant={
                            formData.mode === "advanced" ? "default" : "outline"
                          }
                          className={`h-20 w-full flex-col gap-2 text-left ${
                            formData.mode === "advanced"
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() =>
                            handleFormDataChange({ mode: "advanced" })
                          }
                          disabled={isGenerating}
                        >
                          <div className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5" />
                            <span className="font-semibold">Advanced Mode</span>
                          </div>
                          <span className="text-xs opacity-80">
                            Creates AI prototype for editing
                          </span>
                        </Button>
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

                    <div className="text-center">
                      <div className="text-muted-foreground text-sm">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={formData.mode}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            {formData.mode === "express"
                              ? "Will create a final quiz ready to take immediately"
                              : "Will create a prototype quiz that you can edit and customize"}
                          </motion.span>
                        </AnimatePresence>
                      </div>
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
                      {formData.mode === "express" ? (
                        <Zap className="h-16 w-16 text-primary" />
                      ) : (
                        <Wand2 className="h-16 w-16 text-primary" />
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
                  <h2 className="text-4xl font-bold text-foreground">
                    {formData.mode === "express"
                      ? "Quiz Created Successfully!"
                      : "Prototype Quiz Created Successfully!"}
                  </h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-lg font-medium text-muted-foreground"
                  >
                    {formData.mode === "express"
                      ? "Your quiz is ready to share and take"
                      : "Your quiz is ready to edit and customize"}
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
