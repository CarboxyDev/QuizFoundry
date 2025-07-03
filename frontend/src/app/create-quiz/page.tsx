"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ProtectedRouteGuard } from "@/components/AuthGuard";
import {
  QuizFormData,
  validateQuizForm,
  sanitizeQuizPrompt,
} from "@/lib/validation";
import { generateQuiz } from "@/lib/quiz-api";
import { useRouter } from "next/navigation";

export default function CreateQuizPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<QuizFormData>({
    prompt: "",
    difficulty: "medium",
    optionsCount: 4,
    questionCount: 5,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePromptChange = (value: string) => {
    setFormData((prev) => ({ ...prev, prompt: value }));
  };

  const handleDifficultyChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      difficulty: value as "easy" | "medium" | "hard",
    }));
  };

  const handleOptionsCountChange = (value: string) => {
    setFormData((prev) => ({ ...prev, optionsCount: parseInt(value) }));
  };

  const handleQuestionCountChange = (value: string) => {
    setFormData((prev) => ({ ...prev, questionCount: parseInt(value) }));
  };

  const validateForm = (): boolean => {
    const validation = validateQuizForm(formData);

    if (!validation.isValid) {
      // Show the first error
      toast.error(validation.errors[0]);
      return false;
    }

    return true;
  };

  const handleGenerateQuiz = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);

    try {
      // Sanitize the form data
      const sanitizedData = {
        ...formData,
        prompt: sanitizeQuizPrompt(formData.prompt),
      };

      // Call backend API to generate quiz
      console.log("Generating quiz with:", sanitizedData);
      const quiz = await generateQuiz(sanitizedData);

      toast.success("Quiz generated successfully!");

      // Redirect to the generated quiz view page
      router.push(`/quiz/${quiz.id}`);
    } catch (error) {
      console.error("Error generating quiz:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate quiz. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.08),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.02),transparent_50%)]" />

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header with back button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Main content */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                AI Quiz Generator
              </div>
              <h1 className="text-4xl font-bold mb-4">Create Your Quiz</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Describe what you'd like your quiz to be about, and our AI will
                generate engaging questions for you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="max-w-3xl mx-auto shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center text-xl">
                    Quiz Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Main prompt input */}
                  <div className="space-y-3">
                    <Label htmlFor="prompt" className="text-base font-medium">
                      Quiz Topic & Description
                    </Label>
                    <Textarea
                      id="prompt"
                      placeholder="e.g., Create a quiz about the solar system for middle school students, focusing on planets, their characteristics, and basic astronomy concepts..."
                      value={formData.prompt}
                      onChange={(e) => handlePromptChange(e.target.value)}
                      className="min-h-[120px] text-base resize-none"
                      disabled={isGenerating}
                    />
                    <p className="text-sm text-muted-foreground">
                      Be specific about the topic, target audience, and what
                      aspects you want to focus on.
                    </p>
                  </div>

                  {/* Configuration options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="difficulty"
                        className="text-sm font-medium"
                      >
                        Difficulty Level
                      </Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={handleDifficultyChange}
                        disabled={isGenerating}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
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
                        onValueChange={handleQuestionCountChange}
                        disabled={isGenerating}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 20 }, (_, i) => i + 1).map(
                            (num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? "Question" : "Questions"}
                              </SelectItem>
                            )
                          )}
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
                        onValueChange={handleOptionsCountChange}
                        disabled={isGenerating}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 7 }, (_, i) => i + 2).map(
                            (num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} Options
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Generate button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleGenerateQuiz}
                      disabled={isGenerating || !formData.prompt.trim()}
                      className="w-full h-12 text-base font-medium gap-2"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Quiz
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
