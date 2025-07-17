"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  generateQuestionsForQuiz,
  enhanceQuestion,
  generateOptionsForQuestion,
  getQuestionTypeSuggestions,
  type GeneratedQuestionsResult,
  type EnhancedQuestionResult,
  type GeneratedOptionsResult,
  type QuestionTypeSuggestionsResult,
} from "@/lib/quiz-api";
import { toast } from "sonner";

export function useAIAssistance() {
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEnhancingQuestion, setIsEnhancingQuestion] = useState(false);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);

  // Generate Questions Mutation
  const generateQuestionsMutation = useMutation({
    mutationFn: async ({ context, count }: { context: Parameters<typeof generateQuestionsForQuiz>[0], count: number }) => {
      setIsGeneratingQuestions(true);
      return await generateQuestionsForQuiz(context, count);
    },
    onSuccess: (data: GeneratedQuestionsResult) => {
      toast.success(`Generated ${data.questions.length} questions successfully!`);
    },
    onError: (error: Error) => {
      console.error("Error generating questions:", error);
      toast.error(error.message || "Failed to generate questions");
    },
    onSettled: () => {
      setIsGeneratingQuestions(false);
    },
  });

  // Enhance Question Mutation
  const enhanceQuestionMutation = useMutation({
    mutationFn: async ({ context, questionText }: { context: Parameters<typeof enhanceQuestion>[0], questionText: string }) => {
      setIsEnhancingQuestion(true);
      return await enhanceQuestion(context, questionText);
    },
    onSuccess: (data: EnhancedQuestionResult) => {
      toast.success("Question enhanced successfully!");
    },
    onError: (error: Error) => {
      console.error("Error enhancing question:", error);
      toast.error(error.message || "Failed to enhance question");
    },
    onSettled: () => {
      setIsEnhancingQuestion(false);
    },
  });

  // Generate Options Mutation
  const generateOptionsMutation = useMutation({
    mutationFn: async ({
      questionText,
      existingOptions,
      optionsCount,
    }: {
      questionText: string;
      existingOptions: Array<{ option_text: string; is_correct: boolean }>;
      optionsCount: number;
    }) => {
      setIsGeneratingOptions(true);
      return await generateOptionsForQuestion(
        questionText,
        existingOptions,
        optionsCount
      );
    },
    onSuccess: (data: GeneratedOptionsResult) => {
      toast.success(`Generated ${data.options.length} options successfully!`);
    },
    onError: (error: Error) => {
      console.error("Error generating options:", error);
      toast.error(error.message || "Failed to generate options");
    },
    onSettled: () => {
      setIsGeneratingOptions(false);
    },
  });

  // Get Question Type Suggestions Mutation
  const getQuestionTypesMutation = useMutation({
    mutationFn: async ({ topic, difficulty }: { topic: string; difficulty: "easy" | "medium" | "hard" }) => {
      setIsGettingSuggestions(true);
      return await getQuestionTypeSuggestions(topic, difficulty);
    },
    onSuccess: (data: QuestionTypeSuggestionsResult) => {
      toast.success(`Got ${data.suggestions.length} question type suggestions!`);
    },
    onError: (error: Error) => {
      console.error("Error getting question type suggestions:", error);
      toast.error(error.message || "Failed to get suggestions");
    },
    onSettled: () => {
      setIsGettingSuggestions(false);
    },
  });

  return {
    // Loading states
    isGeneratingQuestions,
    isEnhancingQuestion,
    isGeneratingOptions,
    isGettingSuggestions,
    
    // Mutation functions
    generateQuestions: (context: Parameters<typeof generateQuestionsForQuiz>[0], count: number) => 
      generateQuestionsMutation.mutateAsync({ context, count }),
    enhanceQuestion: (context: Parameters<typeof enhanceQuestion>[0], questionText: string) => 
      enhanceQuestionMutation.mutateAsync({ context, questionText }),
    generateOptions: generateOptionsMutation.mutateAsync,
    getQuestionTypes: (topic: string, difficulty: "easy" | "medium" | "hard") => 
      getQuestionTypesMutation.mutateAsync({ topic, difficulty }),
    
    // Mutation objects for additional control
    generateQuestionsMutation,
    enhanceQuestionMutation,
    generateOptionsMutation,
    getQuestionTypesMutation,
  };
}