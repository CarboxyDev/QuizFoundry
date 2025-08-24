"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

interface QuizGenerateButtonProps {
  mode: "express" | "advanced";
  canSubmit: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function QuizGenerateButton({
  mode,
  canSubmit,
  isGenerating,
  onGenerate,
}: QuizGenerateButtonProps) {
  return (
    <div className="space-y-3 pt-4">
      <div className="flex justify-center">
        <Button
          onClick={onGenerate}
          disabled={!canSubmit || isGenerating}
          className="h-12 w-full max-w-md gap-2 text-base font-medium sm:h-14 sm:text-lg"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              {mode === "express" ? "Generating..." : "Creating..."}
            </>
          ) : (
            <>
              {mode === "express" ? (
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
  );
}
