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
import { Badge } from "@/components/ui/badge";
import { Loader2, BrainCircuit, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import type { QuestionTypeSuggestionsResult } from "@/lib/quiz-api";

interface QuestionTypeSuggestionsDialogProps {
  onGetSuggestions: () => Promise<QuestionTypeSuggestionsResult>;
  onSelectSuggestion: (suggestion: QuestionTypeSuggestionsResult["suggestions"][0]) => void;
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

  const handleSelectSuggestion = (suggestion: QuestionTypeSuggestionsResult["suggestions"][0]) => {
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
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            AI Question Type Suggestions
          </DialogTitle>
          <DialogDescription>
            Get AI-powered suggestions for different types of questions you could create based on your quiz topic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!suggestions ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="text-center space-y-2">
                <BrainCircuit className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Get personalized question type suggestions for your quiz topic
                </p>
              </div>
              
              <Button
                onClick={handleGetSuggestions}
                disabled={isGetting || isLoading}
                className="gap-2"
              >
                {isGetting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Getting Suggestions...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4" />
                    Get Question Ideas
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  AI Question Type Suggestions ({suggestions.length})
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setSuggestions(null)}
                  size="sm"
                >
                  Get New Suggestions
                </Button>
              </div>

              <div className="grid gap-4">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-medium">
                            {suggestion.type}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSuggestion(suggestion);
                          }}
                        >
                          <Lightbulb className="h-3 w-3" />
                          Use This Type
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                        
                        <div className="bg-muted/50 rounded-md p-3">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Example:
                          </p>
                          <p className="text-sm italic">
                            &quot;{suggestion.example}&quot;
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}