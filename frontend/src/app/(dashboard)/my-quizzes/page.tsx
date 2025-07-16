"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import QuizCard from "@/my-quizzes/QuizCard";
import QuizCardSkeleton from "@/my-quizzes/QuizCardSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  Clock,
  Filter,
  Globe,
  LockIcon,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

import { deleteQuiz, getUserQuizzes, type Quiz } from "@/lib/quiz-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// No more mock data – quizzes will be fetched from the backend

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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  const queryClient = useQueryClient();

  // Data fetching – React Query
  const {
    data: quizzes = [],
    isLoading,
    isFetching,
  } = useQuery<Quiz[]>({
    queryKey: ["my-quizzes"],
    queryFn: getUserQuizzes,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-quizzes"] });
      toast.success("Quiz deleted successfully");
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete quiz");
    },
  });

  // Filtering – applied to fetched quizzes
  const filteredQuizzes = quizzes.filter((quiz) => {
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

  const clearFilters = () => {
    setSearchTerm("");
    setDifficultyFilter("all");
    setTypeFilter("all");
    setVisibilityFilter("all");
  };

  const handleQuizAction = (action: string, quizId: string) => {
    if (action === "share") {
      const url = `${window.location.origin}/quiz/${quizId}`;
      navigator.clipboard.writeText(url);
      toast.success("Quiz link copied to clipboard");
    } else if (action === "delete") {
      const quiz = quizzes.find((q) => q.id === quizId);
      if (quiz) {
        setQuizToDelete(quiz);
        setDeleteDialogOpen(true);
      }
    } else if (action === "edit") {
      router.push(`/my-quizzes/edit/${quizId}`);
    } else if (action === "analytics") {
      router.push(`/analytics/quiz/${quizId}`);
    }
  };

  const handleConfirmDelete = () => {
    if (quizToDelete) {
      deleteMutation.mutate(quizToDelete.id);
    }
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
                  Manage and track the quizzes you have created
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
                      <p className="text-2xl font-bold">{quizzes.length}</p>
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
                        {quizzes.filter((q) => q.is_public).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
                      <LockIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Private Quizzes
                      </p>
                      <p className="text-2xl font-bold">
                        {quizzes.filter((q) => !q.is_public).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Recent Quizzes
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          quizzes.filter((q) => {
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

            {/* Enhanced Search and Filters */}
            <motion.div
              className="mt-8 space-y-4"
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-card/60 border-border/40 focus:bg-card h-11 pl-10 backdrop-blur-sm"
                  />
                </motion.div>

                <motion.div
                  className="flex items-center gap-3"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="text-muted-foreground h-4 w-4" />
                    <span className="text-foreground text-sm font-medium">
                      Filters:
                    </span>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Select
                      value={difficultyFilter}
                      onValueChange={(value: DifficultyFilter) =>
                        setDifficultyFilter(value)
                      }
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
                      onValueChange={(value: TypeFilter) =>
                        setTypeFilter(value)
                      }
                    >
                      <SelectTrigger className="bg-card/60 border-border/40 w-32 backdrop-blur-sm">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="ai">✨ AI Made</SelectItem>
                        <SelectItem value="manual">👤 Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Select
                      value={visibilityFilter}
                      onValueChange={(value: VisibilityFilter) =>
                        setVisibilityFilter(value)
                      }
                    >
                      <SelectTrigger className="bg-card/60 border-border/40 w-32 backdrop-blur-sm">
                        <SelectValue placeholder="Visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <LockIcon className="h-3 w-3" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <AnimatePresence>
                    {(searchTerm ||
                      difficultyFilter !== "all" ||
                      typeFilter !== "all" ||
                      visibilityFilter !== "all") && (
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

            {/* Quizzes Grid */}
            <motion.div
              className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              variants={gridVariants}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence mode="wait">
                {isLoading || isFetching ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <QuizCardSkeleton key={idx} />
                  ))
                ) : filteredQuizzes.length === 0 ? (
                  <motion.div
                    className="col-span-full"
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
                            visibilityFilter !== "all"
                              ? "No quizzes found matching your criteria"
                              : "No quizzes created yet"}
                          </h3>
                          <p className="text-muted-foreground mx-auto mb-6 max-w-sm">
                            {searchTerm ||
                            difficultyFilter !== "all" ||
                            typeFilter !== "all" ||
                            visibilityFilter !== "all"
                              ? "Try adjusting your search terms or filters to find your quizzes."
                              : "Start creating quizzes to build your collection and share knowledge with others!"}
                          </p>
                          {!(
                            searchTerm ||
                            difficultyFilter !== "all" ||
                            typeFilter !== "all" ||
                            visibilityFilter !== "all"
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
                              <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  filteredQuizzes.map((quiz, index) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      index={index}
                      onAction={handleQuizAction}
                    />
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{quizToDelete?.title}&quot;?
              This action cannot be undone. All quiz data, questions, and
              attempt history will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Quiz"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
