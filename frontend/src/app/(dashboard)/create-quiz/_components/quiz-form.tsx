"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createQuizAdvanced, createQuizExpress } from "@/lib/quiz-api";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { QuizConfigSection } from "./quiz-config-section";
import { QuizGenerateButton } from "./quiz-generate-button";
import { QuizModeHeader } from "./quiz-mode-header";
import { QuizModeSelector } from "./quiz-mode-selector";
import { QuizSuccessModal } from "./quiz-success-modal";
import { QuizTopicSection } from "./quiz-topic-section";

interface QuizFormData {
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  optionsCount: number;
  questionCount: number;
  isPublic: boolean;
  mode: "express" | "advanced";
}

export function QuizForm() {
  const [formData, setFormData] = useState<QuizFormData>({
    prompt: "",
    difficulty: "medium",
    optionsCount: 4,
    questionCount: 5,
    isPublic: true,
    mode: "express",
  });
  const [isGenerating, setIsGenerating] = useState(false);
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
        await createQuizExpress(expressInput);

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

  const canSubmit = formData.prompt.trim().length > 0;

  return (
    <>
      <QuizModeHeader mode={formData.mode} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="relative mx-auto max-w-3xl overflow-hidden shadow-lg">
          <AnimatePresence>
            {isGenerating && (
              <BorderBeam
                size={100}
                duration={3}
                colorFrom="#ff7d28"
                colorTo="#ff8c46"
                borderWidth={2}
              />
            )}
          </AnimatePresence>

          <CardContent className="relative z-20 space-y-6 p-4 sm:space-y-8 sm:p-6">
            <QuizTopicSection
              prompt={formData.prompt}
              onPromptChange={handlePromptChange}
              questionCount={formData.questionCount}
              optionsCount={formData.optionsCount}
              isGenerating={isGenerating}
            />

            <QuizConfigSection
              formData={formData}
              onFormDataChange={handleFormDataChange}
              isGenerating={isGenerating}
            />

            <Separator />

            <QuizModeSelector
              mode={formData.mode}
              onModeChange={(mode) => handleFormDataChange({ mode })}
            />

            <QuizGenerateButton
              mode={formData.mode}
              canSubmit={canSubmit}
              isGenerating={isGenerating}
              onGenerate={handleGenerateQuiz}
            />
          </CardContent>
        </Card>
      </motion.div>

      <QuizSuccessModal showSuccess={showSuccess} mode={formData.mode} />
    </>
  );
}
