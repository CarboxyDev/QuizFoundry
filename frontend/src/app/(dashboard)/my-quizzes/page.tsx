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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  Circle,
  Clock,
  Copy,
  Edit,
  Eye,
  Filter,
  Flame,
  Globe,
  GlobeLock,
  MoreVertical,
  Play,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  TrendingUp,
  Triangle,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { useState } from "react";

// Mock data - will be replaced with real API calls later
const mockQuizzes = [
  {
    id: "1",
    title: "Advanced JavaScript Concepts",
    description:
      "Test your knowledge of closures, promises, and advanced JS patterns",
    difficulty: "hard",
    is_ai_generated: true,
    is_public: true,
    questions: new Array(15),
    created_at: "2024-01-15T10:30:00Z",
    attempts: 42,
    average_score: 78.5,
  },
  {
    id: "2",
    title: "React Hooks Deep Dive",
    description: "Master useState, useEffect, and custom hooks",
    difficulty: "medium",
    is_ai_generated: false,
    is_public: false,
    questions: new Array(12),
    created_at: "2024-01-20T14:15:00Z",
    attempts: 28,
    average_score: 85.2,
  },
  {
    id: "3",
    title: "TypeScript Fundamentals",
    description: "Learn the basics of TypeScript type system",
    difficulty: "easy",
    is_ai_generated: true,
    is_public: true,
    questions: new Array(8),
    created_at: "2024-01-25T09:00:00Z",
    attempts: 67,
    average_score: 92.1,
  },
];

type DifficultyFilter = "all" | "easy" | "medium" | "hard";
type TypeFilter = "all" | "ai" | "manual";
type VisibilityFilter = "all" | "public" | "private";

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const headerVariants = {
  initial: { opacity: 0, y: -30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const filtersVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.2 },
  },
};

const gridVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

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
    transition: {
      duration: 0.4,
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
};

const emptyStateVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

export default function MyQuizzesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data filtering - will be replaced with real API calls
  const filteredQuizzes = mockQuizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === "all" || quiz.difficulty === difficultyFilter;

    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "ai" && quiz.is_ai_generated) ||
      (typeFilter === "manual" && !quiz.is_ai_generated);

    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "public" && quiz.is_public) ||
      (visibilityFilter === "private" && !quiz.is_public);

    return (
      matchesSearch && matchesDifficulty && matchesType && matchesVisibility
    );
  });

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return {
          icon: Circle,
          color: "text-green-600 dark:text-green-400",
          hoverColor: "hover:text-green-700 dark:hover:text-green-300",
          label: "Easy",
        };
      case "medium":
        return {
          icon: Triangle,
          color: "text-yellow-600 dark:text-yellow-400",
          hoverColor: "hover:text-yellow-700 dark:hover:text-yellow-300",
          label: "Medium",
        };
      case "hard":
        return {
          icon: Flame,
          color: "text-red-600 dark:text-red-400",
          hoverColor: "hover:text-red-700 dark:hover:text-red-300",
          label: "Hard",
        };
      default:
        return {
          icon: Circle,
          color: "text-muted-foreground",
          hoverColor: "hover:text-foreground",
          label: "Unknown",
        };
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDifficultyFilter("all");
    setTypeFilter("all");
    setVisibilityFilter("all");
  };

  const handleQuizAction = (action: string, quizId: string) => {
    // Mock actions - will be replaced with real implementations
    console.log(`${action} quiz ${quizId}`);
  };

  return (
    <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
      <motion.div
        className="from-background via-muted/30 to-muted/50 min-h-screen flex-1 bg-gradient-to-br"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <motion.div
            className="mb-8"
            variants={headerVariants}
            initial="initial"
            animate="animate"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  My Quizzes
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage and track your quiz creations
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/create-quiz">
                  <Button
                    size="lg"
                    className={cn(
                      "bg-primary hover:bg-primary/90",
                      "shadow-sm hover:shadow-md",
                      "transition-all duration-200",
                    )}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Quiz
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Stats Cards */}
            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Total Quizzes
                      </p>
                      <p className="text-2xl font-bold">{mockQuizzes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Public Quizzes
                      </p>
                      <p className="text-2xl font-bold">
                        {mockQuizzes.filter((q) => q.is_public).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Trending Quizzes
                      </p>
                      <p className="text-2xl font-bold">
                        {mockQuizzes.filter((q) => q.average_score > 80).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Recent Quizzes
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          mockQuizzes.filter((q) => {
                            const quizDate = new Date(q.created_at);
                            const today = new Date();
                            const diffTime = Math.abs(
                              today.getTime() - quizDate.getTime(),
                            );
                            const diffDays = Math.ceil(
                              diffTime / (1000 * 60 * 60 * 24),
                            );
                            return diffDays < 7;
                          }).length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Filters */}
            <motion.div
              className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              variants={filtersVariants}
              initial="initial"
              animate="animate"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  placeholder="Search quizzes..."
                  className="w-full sm:w-[180px] lg:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full sm:w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={clearFilters}>
                      Clear Filters
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuTrigger asChild>
                      <DropdownMenuItem>
                        <Select
                          onValueChange={(value) =>
                            setDifficultyFilter(value as DifficultyFilter)
                          }
                          value={difficultyFilter}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              All Difficulties
                            </SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuTrigger asChild>
                      <DropdownMenuItem>
                        <Select
                          onValueChange={(value) =>
                            setTypeFilter(value as TypeFilter)
                          }
                          value={typeFilter}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="ai">AI Generated</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuTrigger asChild>
                      <DropdownMenuItem>
                        <Select
                          onValueChange={(value) =>
                            setVisibilityFilter(value as VisibilityFilter)
                          }
                          value={visibilityFilter}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Visibility" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              All Visibilities
                            </SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>

            {/* Quizzes Grid */}
            <motion.div
              className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              variants={gridVariants}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div className="grid gap-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : filteredQuizzes.length === 0 ? (
                  <motion.div
                    className="col-span-full text-center"
                    variants={emptyStateVariants}
                    initial="initial"
                    animate="animate"
                  >
                    <Sparkles className="text-muted-foreground mx-auto h-16 w-16" />
                    <h3 className="mt-4 text-lg font-semibold">
                      No quizzes found
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Try adjusting your filters or create a new quiz.
                    </p>
                  </motion.div>
                ) : (
                  filteredQuizzes.map((quiz, index) => {
                    const difficultyConfig = getDifficultyConfig(
                      quiz.difficulty,
                    );
                    return (
                      <motion.div
                        key={quiz.id}
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
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleQuizAction("edit", quiz.id)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Quiz
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleQuizAction("duplicate", quiz.id)
                                    }
                                  >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleQuizAction("share", quiz.id)
                                    }
                                  >
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleQuizAction("analytics", quiz.id)
                                    }
                                  >
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    View Analytics
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleQuizAction("delete", quiz.id)
                                    }
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
                                <span className="flex items-center gap-1">
                                  <Brain className="h-3.5 w-3.5" />
                                  {quiz.questions?.length || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatDate(quiz.created_at)}
                                </span>
                                <Tooltip delayDuration={500}>
                                  <TooltipTrigger asChild>
                                    <motion.span
                                      className={cn(
                                        "flex cursor-pointer items-center transition-colors",
                                        difficultyConfig.color,
                                        difficultyConfig.hoverColor,
                                      )}
                                      whileHover={{ scale: 1.2 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <difficultyConfig.icon className="h-3.5 w-3.5" />
                                    </motion.span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="font-medium">
                                      {difficultyConfig.label} Difficulty
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
                                    transition={{
                                      duration: 0.3,
                                      delay: index * 0.1 + 0.5,
                                    }}
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
                              <div className="bg-muted/50 rounded-lg p-2 text-center">
                                <div className="text-muted-foreground">
                                  Attempts
                                </div>
                                <div className="text-foreground font-semibold">
                                  {quiz.attempts}
                                </div>
                              </div>
                              <div className="bg-muted/50 rounded-lg p-2 text-center">
                                <div className="text-muted-foreground">
                                  Avg Score
                                </div>
                                <div className="text-foreground font-semibold">
                                  {quiz.average_score}%
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-auto grid grid-cols-2 gap-2">
                              <Link href={`/quiz/${quiz.id}`}>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                  >
                                    <Play className="mr-1 h-3 w-3" />
                                    Preview
                                  </Button>
                                </motion.div>
                              </Link>

                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleQuizAction("analytics", quiz.id)
                                  }
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
                  })
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
