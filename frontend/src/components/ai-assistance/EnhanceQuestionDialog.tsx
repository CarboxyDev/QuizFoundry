"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import type { EnhancedQuestionResult } from "@/lib/quiz-api";

interface EnhanceQuestionDialogProps {
  questionText: string;
  onEnhance: (questionText: string) => Promise<EnhancedQuestionResult>;
  onAcceptEnhancement: (enhancedText: string) => void;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

export function EnhanceQuestionDialog({
  questionText,
  onEnhance,
  onAcceptEnhancement,
  isLoading,
  trigger,
}: EnhanceQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [enhancement, setEnhancement] = useState<EnhancedQuestionResult["enhanced_question"] | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!questionText.trim()) return;
    
    setIsEnhancing(true);
    try {
      const result = await onEnhance(questionText);
      setEnhancement(result.enhanced_question);
    } catch (error) {
      console.error("Error enhancing question:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAccept = () => {
    if (enhancement) {
      onAcceptEnhancement(enhancement.question_text);
      setEnhancement(null);
      setOpen(false);
    }
  };

  const handleReject = () => {
    setEnhancement(null);
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="gap-2 h-8 w-8 p-0">
      <Wand2 className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Wand2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Enhance Question with AI</span>
            <span className="sm:hidden">Enhance Question</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Improve your question for better clarity, engagement, and appropriate difficulty level.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Original Question</Label>
            <Textarea
              value={questionText}
              readOnly
              className="bg-gray-50 dark:bg-gray-800 text-sm"
              rows={3}
            />
          </div>

          {!enhancement ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleEnhance}
                disabled={isEnhancing || isLoading || !questionText.trim()}
                className="gap-2 w-full sm:w-auto"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">Enhancing Question...</span>
                    <span className="sm:hidden">Enhancing...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Enhance Question</span>
                    <span className="sm:hidden">Enhance</span>
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-sm font-medium">Enhanced Question</Label>
                <Textarea
                  value={enhancement.question_text}
                  readOnly
                  className="bg-green-50 border-green-200 dark:bg-green-900/20 text-sm"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">AI Reasoning</Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20">
                  <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                    {enhancement.reasoning}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="gap-2 w-full sm:w-auto order-2 sm:order-1"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Keep Original</span>
                  <span className="sm:hidden">Keep</span>
                </Button>
                <Button
                  onClick={handleAccept}
                  className="gap-2 w-full sm:w-auto order-1 sm:order-2"
                >
                  <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Use Enhanced</span>
                  <span className="sm:hidden">Use</span>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}