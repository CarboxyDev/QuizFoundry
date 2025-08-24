"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { surpriseMe } from "@/lib/quiz-api";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QuizTopicSectionProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  questionCount: number;
  optionsCount: number;
  isGenerating: boolean;
}

export function QuizTopicSection({
  prompt,
  onPromptChange,
  questionCount,
  optionsCount,
  isGenerating,
}: QuizTopicSectionProps) {
  const [isSurpriseLoading, setIsSurpriseLoading] = useState(false);

  const handleSurpriseMe = async () => {
    setIsSurpriseLoading(true);

    try {
      const surprisePrompt = await surpriseMe();
      onPromptChange(surprisePrompt);
      toast.success("Surprise! Your creative quiz prompt is ready!");
    } catch (error) {
      console.error("Error getting surprise prompt:", error);
      toast.error("Failed to generate surprise prompt. Please try again.");
    } finally {
      setIsSurpriseLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label htmlFor="prompt" className="text-base font-semibold">
            <Sparkles className="h-4 w-4" />
            Quiz Topic
          </Label>
          <p className="text-muted-foreground mt-1 text-sm">
            Describe what you want your quiz to be about
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="sm:flex-shrink-0"
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleSurpriseMe}
            disabled={isGenerating || isSurpriseLoading}
            className="h-9 w-full gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 shadow-sm transition-all duration-300 hover:border-purple-400 hover:from-purple-100 hover:to-pink-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:from-purple-900/20 dark:to-pink-900/20 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30"
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
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        className="min-h-[120px] resize-none text-base"
        disabled={isGenerating || isSurpriseLoading}
      />

      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          This will generate{" "}
          <Badge variant="outline">{questionCount} questions</Badge> with{" "}
          <Badge variant="outline">{optionsCount} options</Badge> each
        </div>
      </div>
    </div>
  );
}
