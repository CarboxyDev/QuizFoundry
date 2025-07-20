"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { QuestionTypeSuggestionsResult } from "@/lib/quiz-api";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Lightbulb, Loader2 } from "lucide-react";
import { useState } from "react";

interface QuestionTypeSuggestionsDialogProps {
  onGetSuggestions: () => Promise<QuestionTypeSuggestionsResult>;
  onSelectSuggestion: (
    suggestion: QuestionTypeSuggestionsResult["suggestions"][0],
  ) => void;
  isLoading: boolean;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export function QuestionTypeSuggestionsDialog({
  onGetSuggestions,
  onSelectSuggestion,
  isLoading,
  trigger,
  disabled = false,
}: QuestionTypeSuggestionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<
    QuestionTypeSuggestionsResult["suggestions"] | null
  >(null);
  const [isGetting, setIsGetting] = useState(false);

  const handleGetSuggestions = async () => {
    setIsGetting(true);
    try {
      const result = await onGetSuggestions();
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Error getting suggestions:", error);
    } finally {
      setIsGetting(false);
    }
  };

  const handleSelectSuggestion = (
    suggestion: QuestionTypeSuggestionsResult["suggestions"][0],
  ) => {
    onSelectSuggestion(suggestion);
    setOpen(false);
  };

  const defaultTrigger = (
    <Button variant="outline" className="gap-2" disabled={disabled}>
      <BrainCircuit className="h-4 w-4" />
      AI Question Ideas
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="h-[85vh] sm:h-[75vh] max-w-3xl w-[95vw] sm:w-full">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">AI Question Type Suggestions</span>
            <span className="sm:hidden">Question Ideas</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Get AI-powered suggestions for different types of questions you
            could create based on your quiz topic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 flex-1 min-h-0">
          {!suggestions ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center space-y-6 py-8"
            >
              <div className="space-y-4 text-center px-4">
                <div className="bg-primary/10 mx-auto w-fit rounded-full p-3 sm:p-4">
                  <BrainCircuit className="text-primary h-8 w-8 sm:h-12 sm:w-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold">AI Question Ideas</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Get personalized question type suggestions for your quiz
                    topic
                  </p>
                </div>
              </div>

              <Button
                onClick={handleGetSuggestions}
                disabled={isGetting || isLoading}
                className="gap-2 w-full sm:w-auto"
              >
                {isGetting ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">Getting Suggestions...</span>
                    <span className="sm:hidden">Getting Ideas...</span>
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Get Question Ideas</span>
                    <span className="sm:hidden">Get Ideas</span>
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
              <div className="flex flex-shrink-0 items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSuggestions(null)}
                  size="sm"
                  className="ml-auto gap-2 text-xs sm:text-sm"
                >
                  <BrainCircuit className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Get New Suggestions</span>
                  <span className="sm:hidden">New Ideas</span>
                </Button>
              </div>

              <ScrollArea className="h-[400px] sm:h-[500px] w-full pr-2 sm:pr-4 flex-1">
                <div className="space-y-3 pr-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-accent/50 cursor-pointer rounded-lg border p-3 sm:p-4 transition-colors"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant="secondary" className="text-xs font-medium flex-shrink-0">
                            {suggestion.type.replace("_", " ")}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 sm:h-8 gap-1 text-xs flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSuggestion(suggestion);
                            }}
                          >
                            <span className="hidden sm:inline">Use</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-muted-foreground text-xs sm:text-sm">
                          {suggestion.description}
                        </p>

                        <div className="bg-muted/50 rounded-md p-2 sm:p-3">
                          <p className="text-muted-foreground mb-1 text-xs">
                            Example:
                          </p>
                          <p className="text-xs sm:text-sm italic">
                            &quot;{suggestion.example}&quot;
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
