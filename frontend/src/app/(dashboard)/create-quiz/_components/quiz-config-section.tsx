"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Lock } from "lucide-react";

interface QuizFormData {
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  optionsCount: number;
  isPublic: boolean;
}

interface QuizConfigSectionProps {
  formData: QuizFormData;
  onFormDataChange: (updates: Partial<QuizFormData>) => void;
  isGenerating: boolean;
}

export function QuizConfigSection({
  formData,
  onFormDataChange,
  isGenerating,
}: QuizConfigSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="space-y-2">
          <Label
            htmlFor="difficulty"
            className="text-xs font-medium sm:text-sm"
          >
            Difficulty Level
          </Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) =>
              onFormDataChange({
                difficulty: value as "easy" | "medium" | "hard",
              })
            }
            disabled={isGenerating}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Easy
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  Medium
                </div>
              </SelectItem>
              <SelectItem value="hard">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Hard
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="questionCount"
            className="text-xs font-medium sm:text-sm"
          >
            Questions
          </Label>
          <Select
            value={formData.questionCount.toString()}
            onValueChange={(value) =>
              onFormDataChange({
                questionCount: parseInt(value),
              })
            }
            disabled={isGenerating}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 5, 7, 10, 15].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "Question" : "Questions"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="optionsCount"
            className="text-xs font-medium sm:text-sm"
          >
            Options
          </Label>
          <Select
            value={formData.optionsCount.toString()}
            onValueChange={(value) =>
              onFormDataChange({
                optionsCount: parseInt(value),
              })
            }
            disabled={isGenerating}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 4, 6, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} Options
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="visibility-switch"
            className="text-xs font-medium sm:text-sm"
          >
            Visibility
          </Label>
          <div className="flex h-9 w-full items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={formData.isPublic ? "public" : "private"}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                  }}
                  className="flex items-center gap-2"
                >
                  {formData.isPublic ? (
                    <>
                      <Globe className="h-3 w-3 text-emerald-500 sm:h-4 sm:w-4" />
                      <span className="text-xs font-medium text-emerald-500 sm:text-sm">
                        Public
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 text-red-500 sm:h-4 sm:w-4" />
                      <span className="text-xs font-medium text-red-500 sm:text-sm">
                        Private
                      </span>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <Switch
              id="visibility-switch"
              checked={formData.isPublic}
              onCheckedChange={(checked) =>
                onFormDataChange({ isPublic: checked })
              }
              disabled={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
