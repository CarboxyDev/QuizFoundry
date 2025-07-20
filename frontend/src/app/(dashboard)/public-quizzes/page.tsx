"use client";

import { ProtectedRouteGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/date";
import {
  getPublicQuizStats,
  getPublicQuizzes,
  type PublicQuizFilters,
} from "@/lib/quiz-api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileQuestion,
  Play,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const QUIZZES_PER_PAGE = 12;

type DifficultyFilter = "all" | "easy" | "medium" | "hard";
type TypeFilter = "all" | "ai" | "manual";
type SortByFilter = "created_at" | "popularity" | "difficulty" | "title";

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

export default function PublicQuizzesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortByFilter>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Build filters for API call
  const filters: PublicQuizFilters = {
    ...(searchTerm && { search: searchTerm }),
    ...(difficultyFilter !== "all" && { difficulty: difficultyFilter }),
    ...(typeFilter !== "all" && { type: typeFilter }),
    sortBy,
    sortOrder,
  };

  const {
    data: publicQuizzesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "public-quizzes",
      currentPage,
      searchTerm,
      difficultyFilter,
      typeFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      getPublicQuizzes(
        QUIZZES_PER_PAGE,
        (currentPage - 1) * QUIZZES_PER_PAGE,
        filters,
      ),
    staleTime: 30 * 1000, // Reduced stale time since we have server-side filtering
  });

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["public-quiz-stats"],
    queryFn: getPublicQuizStats,
    staleTime: 5 * 60 * 1000,
  });

  // Extract quizzes and pagination from response
  const quizzes = publicQuizzesData?.quizzes || [];
  const pagination = publicQuizzesData?.pagination;

  const clearFilters = () => {
    setSearchTerm("");
    setDifficultyFilter("all");
    setTypeFilter("all");
    setSortBy("created_at");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  if (error) {
    return (
      <ProtectedRouteGuard>
        <motion.div
          className="container mx-auto max-w-7xl px-4 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <motion.div
                className="text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <motion.div
                  className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Zap className="text-destructive h-6 w-6" />
                </motion.div>
                <h3 className="text-destructive mb-2 text-lg font-semibold">
                  Oops! Something went wrong
                </h3>
                <p className="text-destructive/80 mb-4">
                  Failed to load public quizzes. Please try again.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => window.location.reload()}
                    variant="destructive"
                  >
                    Try Again
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </ProtectedRouteGuard>
    );
  }

  return (
    <ProtectedRouteGuard>
      <motion.div
        className="from-background via-muted/30 to-muted/50 min-h-screen bg-gradient-to-br"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <motion.div
              className="mb-8"
              variants={headerVariants}
              initial="initial"
              animate="animate"
            >
              <div className="mb-6 flex items-center justify-between">
                <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard")}
                    className="hover:bg-accent"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/create-quiz">
                    <Button
                      className={cn(
                        "bg-primary hover:bg-primary/90",
                        "shadow-sm hover:shadow-md",
                        "transition-all duration-200",
                      )}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Quiz
                    </Button>
                  </Link>
                </motion.div>
              </div>

              <motion.div
                className="from-primary to-primary/80 text-primary-foreground relative overflow-hidden rounded-2xl bg-gradient-to-r p-4 shadow-xl sm:p-6 lg:p-8"
                whileHover={{
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative z-10">
                  <motion.div
                    className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <motion.div
                      className="bg-primary-foreground/20 self-start rounded-xl p-2 backdrop-blur-sm sm:p-3"
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                    </motion.div>
                    <div>
                      <motion.h1
                        className="text-2xl font-bold drop-shadow-sm sm:text-3xl lg:text-4xl"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        Public Quizzes
                      </motion.h1>
                      <motion.p
                        className="text-primary-foreground/90 text-sm font-medium sm:text-base"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        Discover amazing quizzes from our community
                      </motion.p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="text-primary-foreground/90 flex min-h-[32px] flex-wrap items-center gap-2 text-xs font-medium sm:gap-3 sm:text-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <AnimatePresence>
                      {!statsLoading && (
                        <>
                          <motion.div
                            className="bg-primary-foreground/10 flex items-center gap-1.5 rounded-full px-2 py-1 backdrop-blur-sm sm:gap-2 sm:px-3 sm:py-1.5"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{
                              scale: 1.05,
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                            }}
                          >
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="whitespace-nowrap">
                              {stats?.totalQuizzes || 0} quizzes
                            </span>
                          </motion.div>
                          <motion.div
                            className="bg-primary-foreground/10 flex items-center gap-1.5 rounded-full px-2 py-1 backdrop-blur-sm sm:gap-2 sm:px-3 sm:py-1.5"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            whileHover={{
                              scale: 1.05,
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                            }}
                          >
                            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="whitespace-nowrap">
                              {stats?.quizzesByType.aiGenerated || 0} AI-made
                            </span>
                          </motion.div>
                          <motion.div
                            className="bg-primary-foreground/10 flex items-center gap-1.5 rounded-full px-2 py-1 backdrop-blur-sm sm:gap-2 sm:px-3 sm:py-1.5"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            whileHover={{
                              scale: 1.05,
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                            }}
                          >
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="whitespace-nowrap">
                              {stats?.recentActivity.addedLast24Hours || 0}{" "}
                              today
                            </span>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                <motion.div
                  className="bg-primary-foreground/10 absolute -top-4 -right-4 h-24 w-24 rounded-full"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="bg-primary-foreground/5 absolute -bottom-8 -left-8 h-32 w-32 rounded-full"
                  animate={{ scale: [1, 1.2, 1], rotate: [360, 180, 0] }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="mb-8 space-y-4"
              variants={filtersVariants}
              initial="initial"
              animate="animate"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <motion.div
                  className="relative max-w-md flex-1"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search quizzes by title or description..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-card/60 border-border/40 focus:bg-card h-11 pl-10"
                  />
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center gap-3"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Select
                      value={difficultyFilter}
                      onValueChange={(value: DifficultyFilter) => {
                        setDifficultyFilter(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="bg-card/60 border-border/40 w-32 backdrop-blur-sm">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
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
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Select
                      value={typeFilter}
                      onValueChange={(value: TypeFilter) => {
                        setTypeFilter(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="bg-card/60 border-border/40 w-40 backdrop-blur-sm">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="ai">✨ AI Made</SelectItem>
                        <SelectItem value="manual">👤 Human Made</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Select
                      value={sortBy}
                      onValueChange={(value: SortByFilter) => {
                        setSortBy(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="bg-card/60 border-border/40 w-44 backdrop-blur-sm">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">
                          📅 Date Created
                        </SelectItem>
                        <SelectItem value="popularity">
                          🔥 Popularity
                        </SelectItem>
                        <SelectItem value="difficulty">
                          ⚡ Difficulty
                        </SelectItem>
                        <SelectItem value="title">🔤 Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="bg-card/60 border-border/40 backdrop-blur-sm"
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                  </motion.div>

                  <AnimatePresence>
                    {(searchTerm ||
                      difficultyFilter !== "all" ||
                      typeFilter !== "all" ||
                      sortBy !== "created_at" ||
                      sortOrder !== "desc") && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="bg-card/60 border-border/40 backdrop-blur-sm"
                        >
                          Clear
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <Card className="border-border/50 bg-card/80 relative flex h-full flex-col overflow-hidden backdrop-blur-sm">
                        <CardHeader className="flex-shrink-0 pb-4">
                          <div className="flex h-[3rem] items-start justify-between gap-3">
                            <Skeleton className="h-6 w-3/4" />
                          </div>
                          <div className="flex h-[2.5rem] items-start">
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-2/3" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-grow flex-col pt-0">
                          <div className="mb-2 flex min-h-[24px] items-center justify-end">
                            <Skeleton className="h-6 w-12 rounded-full" />
                          </div>

                          <div className="mb-4 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Skeleton className="h-3.5 w-3.5 rounded" />
                                <Skeleton className="h-4 w-4" />
                              </div>
                              <div className="flex items-center gap-1">
                                <Skeleton className="h-3.5 w-3.5 rounded" />
                                <Skeleton className="h-4 w-4" />
                              </div>
                              <Skeleton className="h-2 w-2 rounded-full" />
                            </div>
                            <div className="flex items-center gap-1">
                              <Skeleton className="h-3.5 w-3.5 rounded" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>

                          <div className="mt-auto">
                            <Skeleton className="h-10 w-full rounded-md" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!isLoading && (
                <>
                  {quizzes.length === 0 ? (
                    <motion.div
                      variants={emptyStateVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <Card className="bg-card/60 border-2 border-dashed backdrop-blur-sm">
                        <CardContent className="pt-12 pb-12">
                          <div className="text-center">
                            <motion.div
                              className="bg-muted mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              <Brain className="text-muted-foreground h-10 w-10" />
                            </motion.div>
                            <h3 className="text-foreground mb-3 text-xl font-semibold">
                              {searchTerm ||
                              difficultyFilter !== "all" ||
                              typeFilter !== "all" ||
                              sortBy !== "created_at" ||
                              sortOrder !== "desc"
                                ? "No quizzes found matching your criteria"
                                : "No public quizzes yet"}
                            </h3>
                            <p className="text-muted-foreground mx-auto mb-6 max-w-sm">
                              {searchTerm ||
                              difficultyFilter !== "all" ||
                              typeFilter !== "all" ||
                              sortBy !== "created_at" ||
                              sortOrder !== "desc"
                                ? "Try adjusting your search terms or filters to find more quizzes."
                                : "Be the first to create and share a quiz with the community!"}
                            </p>
                            {!(
                              searchTerm ||
                              difficultyFilter !== "all" ||
                              typeFilter !== "all" ||
                              sortBy !== "created_at" ||
                              sortOrder !== "desc"
                            ) ? (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Link href="/create-quiz">
                                  <Button
                                    size="lg"
                                    className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r"
                                  >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Create Your First Quiz
                                  </Button>
                                </Link>
                              </motion.div>
                            ) : (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  variant="outline"
                                  onClick={clearFilters}
                                >
                                  Clear Filters
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      variants={gridVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <AnimatePresence>
                        {quizzes.map((quiz, index) => {
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
                                  "group border-border/50 bg-card/80 cursor-pointer overflow-hidden backdrop-blur-sm transition-all duration-300",
                                  "hover:shadow-primary/20 hover:bg-card hover:border-primary/50 hover:shadow-xl",
                                  "relative flex h-full flex-col",
                                )}
                              >
                                <CardHeader className="flex-shrink-0 pb-4">
                                  <div className="flex h-[3rem] items-start justify-between gap-3">
                                    <h3 className="text-foreground group-hover:text-primary line-clamp-2 flex-1 leading-snug font-semibold transition-colors">
                                      {quiz.title}
                                    </h3>
                                  </div>

                                  <div className="flex h-[2.5rem] items-start">
                                    {quiz.description ? (
                                      <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                                        {quiz.description}
                                      </p>
                                    ) : null}
                                  </div>

                                  <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                                    <span>
                                      by {quiz.creator?.name || "Anonymous"}
                                    </span>
                                  </div>
                                </CardHeader>

                                <CardContent className="flex flex-grow flex-col pt-0">
                                  <div className="mb-2 flex min-h-[24px] items-center justify-end">
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
                                          <p className="font-medium">
                                            {quiz.attempts ?? 0} Attempts
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                      <Tooltip delayDuration={500}>
                                        <TooltipTrigger asChild>
                                          <div
                                            className={cn(
                                              "h-2 w-2 cursor-pointer rounded-full transition-all duration-200 hover:scale-125",
                                              quiz.difficulty === "easy" &&
                                                "bg-green-500",
                                              quiz.difficulty === "medium" &&
                                                "bg-yellow-500",
                                              quiz.difficulty === "hard" &&
                                                "bg-red-500",
                                            )}
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          <p className="font-medium">
                                            {quiz.difficulty
                                              .charAt(0)
                                              .toUpperCase() +
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

                                  <div className="mt-auto">
                                    <Link
                                      href={`/quiz/${quiz.id}`}
                                      className="block"
                                    >
                                      <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <Button
                                          size="lg"
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
                                          <span className="font-medium">
                                            Start Quiz
                                          </span>
                                        </Button>
                                      </motion.div>
                                    </Link>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {pagination && pagination.total > 0 && (
                    <motion.div
                      className="mt-12 flex flex-col items-center gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <div className="text-muted-foreground text-center text-sm">
                        Showing {pagination.offset + 1} to{" "}
                        {Math.min(
                          pagination.offset + pagination.limit,
                          pagination.total,
                        )}{" "}
                        of {pagination.total} quizzes
                      </div>

                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.05, x: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1}
                            className="bg-card/60 border-border/40 backdrop-blur-sm"
                          >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Previous
                          </Button>
                        </motion.div>

                        <motion.div
                          className="bg-card/60 border-border/40 rounded-lg border px-4 py-2 backdrop-blur-sm"
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="text-foreground text-sm font-medium">
                            Page {currentPage} of{" "}
                            {Math.ceil(pagination.total / pagination.limit)}
                          </span>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05, x: 2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            disabled={!pagination.hasMore}
                            className="bg-card/60 border-border/40 backdrop-blur-sm"
                          >
                            Next
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </ProtectedRouteGuard>
  );
}
