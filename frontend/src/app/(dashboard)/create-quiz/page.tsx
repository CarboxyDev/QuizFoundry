"use client";

import { ProtectedRouteGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  createPrototypeQuiz,
  createQuizAdvanced,
  createQuizExpress,
  surpriseMe,
} from "@/lib/quiz-api";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Edit3,
  Globe,
  Loader2,
  Lock,
  Sparkles,
  Wand2,
  Wrench,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface QuizFormData {
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  optionsCount: number;
  questionCount: number;
  isManual: boolean;
  isPublic: boolean;
}

export default function CreateQuizPage() {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [formData, setFormData] = useState<QuizFormData>({
    prompt: "",
    difficulty: "medium",
    optionsCount: 4,
    questionCount: 5,
    isManual: false,
    isPublic: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSurpriseLoading, setIsSurpriseLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleModeChange = (checked: boolean) => {
    setIsAdvancedMode(checked);

    if (!checked) {
      // Reset to Express mode defaults
      setFormData((prev) => ({
        ...prev,
        difficulty: "medium",
        optionsCount: 4,
        questionCount: 5,
        isManual: false,
        // Keep isPublic as is when switching back to Express mode
      }));
    }
  };

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
      console.log("Generating quiz with:", {
        mode: isAdvancedMode ? "advanced" : "express",
        formData,
      });

      let result;
      if (isAdvancedMode) {
        // Check if manual mode is enabled
        if (formData.isManual) {
          // Create prototype quiz for manual editing
          const prototypeResult = await createPrototypeQuiz({
            prompt: formData.prompt,
            questionCount: formData.questionCount,
            optionsCount: formData.optionsCount,
            difficulty: formData.difficulty,
          });

          toast.success("Prototype quiz created! Redirecting to editor...");

          // Store prototype data and redirect to manual editing page
          const prototypeData = {
            prototype: prototypeResult.prototype,
            originalPrompt: prototypeResult.originalPrompt,
            isPublic: formData.isPublic,
          };

          // Use URL searchParams to pass the data
          const searchParams = new URLSearchParams({
            data: JSON.stringify(prototypeData),
          });

          router.push(`/create-quiz/manual?${searchParams.toString()}`);
          return;
        } else {
          // Regular advanced mode
          const advancedInput = {
            prompt: formData.prompt,
            difficulty: formData.difficulty,
            questionCount: formData.questionCount,
            optionsCount: formData.optionsCount,
            isManualMode: false,
            is_public: formData.isPublic,
          };
          result = await createQuizAdvanced(advancedInput);
        }
      } else {
        // Map form data to express API input
        const expressInput = {
          prompt: formData.prompt,
          is_public: formData.isPublic,
        };
        result = await createQuizExpress(expressInput);
      }

      toast.success("Quiz generated successfully!");

      if (!isAdvancedMode) {
        setShowSuccess(true);
        setIsGenerating(false);

        setTimeout(() => {
          router.push("/my-quizzes");
        }, 3000);
      } else {
        router.push("/my-quizzes");
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
                {isAdvancedMode ? "Advanced Mode" : "Express Mode"}
              </div>
              <h1 className="mb-4 text-4xl font-bold">Create Your Quiz</h1>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                Describe what you want your quiz to be about, and our AI will
                generate engaging questions for you.
              </p>
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
                      <motion.div
                        className="h-full w-full rounded-lg"
                        style={{
                          background: `conic-gradient(from 0deg, transparent 60%, rgb(255, 125, 40) 70%, rgb(255, 140, 70) 75%, rgb(255, 125, 40) 80%, transparent 90%)`,
                        }}
                        animate={{
                          rotate: [0, 90, 180, 270, 360],
                        }}
                        transition={{
                          duration: 3,
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
                          Quiz Topic & Description
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
                      placeholder="Example: Create a quiz on the history of the internet"
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
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label
                          htmlFor="visibility-switch"
                          className="text-base font-medium"
                        >
                          {formData.isPublic ? "Public" : "Private"} Quiz
                        </Label>
                        <p className="text-muted-foreground text-sm">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={
                                formData.isPublic
                                  ? "public-desc"
                                  : "private-desc"
                              }
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                              {formData.isPublic
                                ? "Anyone can find and take this quiz"
                                : "Only you and your collaborators can access this quiz"}
                            </motion.span>
                          </AnimatePresence>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={formData.isPublic ? "public" : "private"}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="flex items-center gap-2"
                            >
                              {formData.isPublic ? (
                                <>
                                  <Globe className="h-4 w-4 text-emerald-500" />
                                  <span className="font-medium text-emerald-500">
                                    Public
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Lock className="h-4 w-4 text-red-500" />
                                  <span className="font-medium text-red-500">
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

                  <Separator />

                  {/* Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label
                        htmlFor="mode-switch"
                        className="text-base font-medium"
                      >
                        {isAdvancedMode ? "Advanced Mode" : "Express Mode"}
                        {isAdvancedMode ? (
                          <Wrench className="text-primary h-4 w-4" />
                        ) : (
                          <Zap className="text-primary h-4 w-4" />
                        )}
                      </Label>
                      <p className="text-muted-foreground text-sm">
                        {isAdvancedMode
                          ? "Customize question count, difficulty, and options"
                          : "Quick generation with default settings (5 questions, medium difficulty)"}
                      </p>
                    </div>
                    <Switch
                      id="mode-switch"
                      checked={isAdvancedMode}
                      onCheckedChange={handleModeChange}
                      disabled={isGenerating}
                    />
                  </div>

                  <AnimatePresence>
                    {isAdvancedMode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          <div className="space-y-3">
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
                                  difficulty: value as
                                    | "easy"
                                    | "medium"
                                    | "hard",
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

                          <div className="space-y-3">
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

                          <div className="space-y-3">
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
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="manual"
                              checked={formData.isManual}
                              onCheckedChange={(checked) =>
                                handleFormDataChange({ isManual: !!checked })
                              }
                              disabled={isGenerating}
                            />
                            <div className="space-y-1">
                              <Label
                                htmlFor="manual"
                                className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                              >
                                <Edit3 className="h-4 w-4" />
                                Manual Mode
                              </Label>
                              <p className="text-muted-foreground text-xs">
                                Generate a prototype quiz that you can edit
                                before saving
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Generate Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleGenerateQuiz}
                      disabled={!canSubmit || isGenerating}
                      className="h-12 w-full gap-2 text-base font-medium"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          {isAdvancedMode && formData.isManual
                            ? "Create Prototype Quiz"
                            : "Generate Quiz"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>

                {/* Success Overlay */}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      key="successOverlay"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 20,
                      }}
                      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden rounded-lg shadow-inner"
                    >
                      {/* Animated gradient background */}
                      <motion.div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-400"
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />

                      {/* Confetti / sparkles */}
                      {Array.from({ length: 20 }).map((_, i) => {
                        const size = Math.random() * 8 + 4; // 4-12px
                        const left = Math.random() * 100;
                        const delay = Math.random() * 0.5;
                        return (
                          <motion.span
                            key={i}
                            style={{
                              left: `${left}%`,
                              width: size,
                              height: size,
                            }}
                            className="absolute bottom-0 rounded-full bg-white/80"
                            initial={{ y: 0, opacity: 1 }}
                            animate={{ y: -350, opacity: 0 }}
                            transition={{
                              duration: 2.2,
                              delay,
                              repeat: Infinity,
                              ease: "easeOut",
                            }}
                          />
                        );
                      })}

                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center text-center text-white drop-shadow-lg">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                          }}
                          className="flex items-center justify-center rounded-full bg-white/10 p-4 backdrop-blur"
                        >
                          <CheckCircle2 className="h-20 w-20 text-white" />
                        </motion.div>
                        <motion.h2
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="mt-6 text-3xl font-bold"
                        >
                          Quiz Ready!
                        </motion.h2>
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="mt-2 text-lg font-medium"
                        >
                          Taking you to all your quizzes...
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRouteGuard>
  );
}
