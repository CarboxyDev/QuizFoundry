"use client";

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
  Clock,
  Edit,
  Eye,
  FileQuestion,
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
          "relative flex h-full flex-col",
        )}
      >
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="flex h-[3rem] items-start justify-between gap-3">
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

          <div className="flex h-[2.5rem] items-start">
            {quiz.description ? (
              <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                {quiz.description}
              </p>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="flex flex-grow flex-col pt-0">
          {/* AI Badge Row */}
          <div className="mb-2 flex min-h-[24px] items-center justify-between">
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
            </div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1 + 0.5,
              }}
            >
              <Badge
                variant="secondary"
                className={cn(
                  "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
                  !quiz.is_ai_generated && "invisible",
                )}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                AI
              </Badge>
            </motion.div>
          </div>

          {/* Stats Row */}
          <div className="mb-4 flex items-center justify-between text-sm">
            <div className="text-muted-foreground flex items-center gap-3">
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <span className="hover:text-foreground flex cursor-pointer items-center gap-1 transition-colors">
                    <FileQuestion className="h-3.5 w-3.5" />
                    {quiz.question_count || 0}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-medium">
                    {quiz.question_count || 0} Questions
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <span className="hover:text-foreground flex cursor-pointer items-center gap-1 transition-colors">
                    <Play className="h-3.5 w-3.5" />
                    {quiz.attempts ?? 0}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-medium">{quiz.attempts ?? 0} Attempts</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "h-2 w-2 cursor-pointer rounded-full transition-all duration-200 hover:scale-125",
                      quiz.difficulty === "easy" && "bg-green-500",
                      quiz.difficulty === "medium" && "bg-yellow-500",
                      quiz.difficulty === "hard" && "bg-red-500",
                    )}
                  />
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
            <div className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(quiz.created_at)}
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2">
            <Link href={`/my-quizzes/preview/${quiz.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "group relative w-full overflow-hidden",
                    "bg-muted/60 hover:bg-muted/80 text-foreground",
                    "transition-all duration-300 ease-out",
                    "shadow-sm hover:shadow-md",
                    "border-border/50 hover:border-border border",
                  )}
                >
                  <motion.div
                    className="via-foreground/5 absolute inset-0 -translate-x-full -skew-x-12 transform bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{
                      duration: 0.6,
                      ease: "easeInOut",
                    }}
                  />
                  <Play className="mr-1 h-3 w-3" />
                  Preview
                </Button>
              </motion.div>
            </Link>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                onClick={() => onAction("analytics", quiz.id)}
                className={cn(
                  "group relative w-full overflow-hidden",
                  "bg-muted/60 hover:bg-muted/80 text-foreground",
                  "transition-all duration-300 ease-out",
                  "shadow-sm hover:shadow-md",
                  "border-border/50 hover:border-border border",
                )}
              >
                <motion.div
                  className="via-foreground/5 absolute inset-0 -translate-x-full -skew-x-12 transform bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                  }}
                />
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
