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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Enhance Question with AI
          </DialogTitle>
          <DialogDescription>
            Improve your question for better clarity, engagement, and appropriate difficulty level.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Original Question</Label>
            <Textarea
              value={questionText}
              readOnly
              className="bg-gray-50 dark:bg-gray-800"
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
                className="gap-2"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enhancing Question...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Enhance Question
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
                <Label>Enhanced Question</Label>
                <Textarea
                  value={enhancement.question_text}
                  readOnly
                  className="bg-green-50 border-green-200 dark:bg-green-900/20"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>AI Reasoning</Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {enhancement.reasoning}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Keep Original
                </Button>
                <Button
                  onClick={handleAccept}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Use Enhanced
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}