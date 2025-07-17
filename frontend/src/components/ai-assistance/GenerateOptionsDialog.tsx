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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Wand2, Undo2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { GeneratedOptionsResult } from "@/lib/quiz-api";

interface GenerateOptionsDialogProps {
  questionText: string;
  existingOptions: Array<{ 
    id: string;
    option_text: string; 
    is_correct: boolean;
  }>;
  onGenerate: (params: {
    questionText: string;
    existingOptions: Array<{ option_text: string; is_correct: boolean }>;
    optionsCount: number;
  }) => Promise<GeneratedOptionsResult>;
  onReplaceOptions: (selectedOptionIds: string[], newOptions: GeneratedOptionsResult["options"]) => void;
  onUndoReplace: (undoData: { selectedOptionIds: string[], originalOptions: Array<{ id: string; option_text: string; is_correct: boolean; order_index: number }> }) => void;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

export function GenerateOptionsDialog({
  questionText,
  existingOptions,
  onGenerate,
  onReplaceOptions,
  onUndoReplace,
  isLoading,
  trigger,
}: GenerateOptionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastReplacement, setLastReplacement] = useState<{
    selectedOptionIds: string[];
    originalOptions: Array<{ id: string; option_text: string; is_correct: boolean; order_index: number }>;
  } | null>(null);

  // Only show incorrect options for selection (can't replace correct answers)
  const incorrectOptions = existingOptions.filter(option => !option.is_correct);

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptionIds(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleGenerate = async () => {
    if (selectedOptionIds.length === 0) return;
    
    setIsGenerating(true);
    try {
      // Store original options for undo
      const originalOptions = existingOptions
        .filter(opt => selectedOptionIds.includes(opt.id))
        .map(opt => ({
          id: opt.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          order_index: existingOptions.findIndex(o => o.id === opt.id)
        }));

      const result = await onGenerate({
        questionText,
        existingOptions: existingOptions.map(opt => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct
        })),
        optionsCount: selectedOptionIds.length,
      });

      // Store undo data
      setLastReplacement({
        selectedOptionIds: [...selectedOptionIds],
        originalOptions
      });

      // Replace options directly
      onReplaceOptions(selectedOptionIds, result.options);
      
      // Clear selections and close dialog
      setSelectedOptionIds([]);
      setOpen(false);
      
      // Show success message
      toast.success(`Replaced ${selectedOptionIds.length} option${selectedOptionIds.length !== 1 ? 's' : ''} with AI-generated alternatives`);
      
    } catch (error) {
      console.error("Error generating options:", error);
      toast.error("Failed to generate options. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUndo = () => {
    if (lastReplacement) {
      onUndoReplace(lastReplacement);
      setLastReplacement(null);
      toast.success("Undid option replacement");
    }
  };

  const handleSelectAll = () => {
    setSelectedOptionIds(incorrectOptions.map(opt => opt.id));
  };

  const handleDeselectAll = () => {
    setSelectedOptionIds([]);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Wand2 className="h-4 w-4" />
      AI Improve Options
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Improve Options
          </DialogTitle>
          <DialogDescription>
            Select options to replace with AI-generated alternatives. The AI will create better distractors that are more challenging but still clearly incorrect.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-6 flex-1 min-h-0">
          <div className="space-y-2">
            <Label>Question</Label>
            <div className="p-3 bg-gray-50 border rounded-md dark:bg-gray-800">
              <p className="text-sm">{questionText}</p>
            </div>
          </div>

          <div className="space-y-3 flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <Label>Select Options to Replace</Label>
              {incorrectOptions.length > 1 && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-8 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="h-8 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
            
            <ScrollArea className="w-full h-[250px] pr-4">
              <div className="space-y-2 pr-2">
                <AnimatePresence>
                  {existingOptions.map((option) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                        option.is_correct
                          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/50"
                          : selectedOptionIds.includes(option.id)
                          ? "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {option.is_correct ? (
                          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        ) : (
                          <Checkbox
                            id={option.id}
                            checked={selectedOptionIds.includes(option.id)}
                            onCheckedChange={() => handleOptionToggle(option.id)}
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={option.id}
                          className={`block text-sm ${
                            option.is_correct 
                              ? "cursor-default font-medium text-green-700 dark:text-green-300" 
                              : "cursor-pointer text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {option.option_text}
                        </label>
                      </div>
                      
                      {option.is_correct && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Correct
                        </span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
            
            {incorrectOptions.length === 0 && (
              <div className="text-center py-6">
                <div className="space-y-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    No incorrect options available to replace.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 space-y-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || isLoading || selectedOptionIds.length === 0}
                className="flex-1 gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Better Options...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Replace {selectedOptionIds.length} Option{selectedOptionIds.length !== 1 ? 's' : ''} with AI
                  </>
                )}
              </Button>

              {lastReplacement && (
                <Button
                  variant="outline"
                  onClick={handleUndo}
                  className="gap-2"
                >
                  <Undo2 className="h-4 w-4" />
                  Undo
                </Button>
              )}
            </div>
            
            {selectedOptionIds.length === 0 && incorrectOptions.length > 0 && (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  Select at least one option to replace.
                </p>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}