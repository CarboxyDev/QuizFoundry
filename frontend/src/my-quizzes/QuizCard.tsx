"use client";

import { DifficultyIcon } from "@/components/DifficultyIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/date";
import type { Quiz } from "@/lib/quiz-api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  Clock,
  Edit,
  Eye,
  Globe,
  GlobeLock,
  MoreVertical,
  Play,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";

const cardVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4 },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: { duration: 0.2 },
  },
};

interface QuizCardProps {
  quiz: Quiz;
  index: number;
  onAction: (action: string, quizId: string) => void;
}

export default function QuizCard({ quiz, index, onAction }: QuizCardProps) {
  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <Card
        className={cn(
          "group border-border/50 bg-card/80 overflow-hidden backdrop-blur-sm transition-all duration-300",
          "hover:shadow-primary/20 hover:bg-card hover:border-primary/50 hover:shadow-xl",
          "flex h-full flex-col",
        )}
      >
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-foreground group-hover:text-primary line-clamp-2 flex-1 leading-snug font-semibold transition-colors">
              {quiz.title}
            </h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onAction("edit", quiz.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Quiz
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction("share", quiz.id)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction("analytics", quiz.id)}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onAction("delete", quiz.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex h-10 items-start">
            {quiz.description && (
              <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                {quiz.description}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-grow flex-col pt-0">
          <div className="mb-4 flex items-center justify-between text-sm">
            <div className="text-muted-foreground flex items-center gap-3">
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <span className="hover:text-foreground flex cursor-pointer items-center gap-1 transition-colors">
                    <Brain className="h-3.5 w-3.5" />
                    {quiz.questions?.length || 0}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-medium">
                    {quiz.questions?.length || 0} Questions
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(quiz.created_at)}
              </span>
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <motion.span
                    className="flex cursor-pointer items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <DifficultyIcon difficulty={quiz.difficulty} size="sm" />
                  </motion.span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-medium">
                    {quiz.difficulty.charAt(0).toUpperCase() +
                      quiz.difficulty.slice(1)}{" "}
                    Difficulty
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              {quiz.is_public ? (
                <Tooltip delayDuration={500}>
                  <TooltipTrigger asChild>
                    <Globe className="h-3.5 w-3.5 text-green-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Public Quiz</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip delayDuration={500}>
                  <TooltipTrigger asChild>
                    <GlobeLock className="text-muted-foreground h-3.5 w-3.5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Private Quiz</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {quiz.is_ai_generated && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
                >
                  <Badge
                    variant="secondary"
                    className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>

          {/* Quiz Stats */}
          <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
            <motion.div
              className="rounded-lg border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100 p-3 text-center backdrop-blur-sm dark:border-blue-800/30 dark:from-blue-950/50 dark:to-blue-900/30"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-1 flex items-center justify-center gap-1">
                <BarChart3 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Attempts
                </span>
              </div>
              <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                {quiz.attempts ?? 0}
              </div>
            </motion.div>

            <motion.div
              className="rounded-lg border border-green-200/50 bg-gradient-to-br from-green-50 to-green-100 p-3 text-center backdrop-blur-sm dark:border-green-800/30 dark:from-green-950/50 dark:to-green-900/30"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-1 flex items-center justify-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  Avg Score
                </span>
              </div>
              <div className="text-lg font-bold text-green-800 dark:text-green-200">
                {quiz.average_score?.toFixed(1) ?? 0}%
              </div>
            </motion.div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2">
            <Link href={`/my-quizzes/preview/${quiz.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button variant="outline" size="sm" className="w-full">
                  <Play className="mr-1 h-3 w-3" />
                  Preview
                </Button>
              </motion.div>
            </Link>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                onClick={() => onAction("analytics", quiz.id)}
                className="w-full"
              >
                <Eye className="mr-1 h-3 w-3" />
                Analytics
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
