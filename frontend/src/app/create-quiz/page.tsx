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
  createQuizAdvanced,
  createQuizExpress,
  surpriseMe,
} from "@/lib/quiz-api";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Edit3,
  Loader2,
  Settings2,
  Sparkles,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface QuizFormData {
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  optionsCount: number;
  questionCount: number;
  isManual: boolean;
}

export default function CreateQuizPage() {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [formData, setFormData] = useState<QuizFormData>({
    prompt: "",
    difficulty: "medium",
    optionsCount: 4,
    questionCount: 5,
    isManual: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSurpriseLoading, setIsSurpriseLoading] = useState(false);
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
        // Map form data to advanced API input
        const advancedInput = {
          prompt: formData.prompt,
          difficulty: formData.difficulty,
          questionCount: formData.questionCount,
          optionsCount: formData.optionsCount,
          isManualMode: formData.isManual,
        };
        result = await createQuizAdvanced(advancedInput);
      } else {
        // Map form data to express API input
        const expressInput = {
          prompt: formData.prompt,
        };
        result = await createQuizExpress(expressInput);
      }

      toast.success("Quiz generated successfully!");

      // Navigate to the page specified by the backend
      router.push(result.redirectTo);
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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-4"
          >
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Main content */}
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
              <Card className="mx-auto max-w-3xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Quiz Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
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
                      placeholder="e.g., Create a quiz about the solar system for middle school students, focusing on planets, their characteristics, and basic astronomy concepts..."
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
                        each.
                      </div>
                      <div className="text-muted-foreground">
                        {formData.prompt.length} characters
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

                  {/* Advanced Settings */}
                  <AnimatePresence>
                    {isAdvancedMode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center gap-2">
                          <Settings2 className="text-primary h-5 w-5" />
                          <h3 className="text-lg font-semibold">
                            Advanced Settings
                          </h3>
                        </div>

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
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRouteGuard>
  );
}
