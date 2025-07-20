"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { GeneratedQuestionsResult } from "@/lib/quiz-api";

interface GenerateQuestionsDialogProps {
  onGenerate: (count: number) => Promise<GeneratedQuestionsResult>;
  onAcceptQuestions: (questions: GeneratedQuestionsResult["questions"]) => void;
  isLoading: boolean;
  trigger?: React.ReactNode;
  disabled?: boolean;
  remainingQuestions?: number;
}

export function GenerateQuestionsDialog({
  onGenerate,
  onAcceptQuestions,
  isLoading,
  trigger,
  disabled = false,
  remainingQuestions = 20,
}: GenerateQuestionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(Math.min(2, remainingQuestions));
  const [isGenerating, setIsGenerating] = useState(false);

  // Update question count when remaining questions changes
  useEffect(() => {
    setQuestionCount(prevCount => Math.min(prevCount, remainingQuestions));
  }, [remainingQuestions]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await onGenerate(questionCount);
      onAcceptQuestions(result.questions);
      setOpen(false);
    } catch (error) {
      console.error("Error generating questions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="gap-2" disabled={disabled}>
      <Sparkles className="h-4 w-4" />
      AI Generate Questions
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95vw] sm:w-full">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Generate Questions with AI</span>
            <span className="sm:hidden">Generate Questions</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Generate additional questions for your quiz using AI. The questions will be automatically added to your quiz based on your quiz topic and difficulty level.
            {remainingQuestions > 0 && (
              <span className="block mt-2 text-xs sm:text-sm font-medium text-orange-600">
                You can add {remainingQuestions} more question{remainingQuestions !== 1 ? 's' : ''} (limit: 20 questions)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="questionCount" className="text-sm font-medium">Number of Questions</Label>
              <Select
                value={questionCount.toString()}
                onValueChange={(value) => setQuestionCount(parseInt(value))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((count) => (
                    count <= remainingQuestions && (
                      <SelectItem key={count} value={count.toString()} className="text-sm">
                        {count} Question{count !== 1 ? 's' : ''}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isLoading}
              className="w-full gap-2 text-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="hidden sm:inline">Generating Questions...</span>
                  <span className="sm:hidden">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Generate {questionCount} Question{questionCount !== 1 ? "s" : ""}</span>
                  <span className="sm:hidden">Generate {questionCount}Q</span>
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}