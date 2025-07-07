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
import { getPublicQuizzes } from "@/lib/quiz-api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Brain,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Filter,
  Flame,
  Play,
  Search,
  Sparkles,
  TrendingUp,
  Triangle,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const QUIZZES_PER_PAGE = 12;

type DifficultyFilter = "all" | "easy" | "medium" | "hard";
type TypeFilter = "all" | "ai" | "manual";

export default function PublicQuizzesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const {
    data: quizzes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-quizzes", currentPage],
    queryFn: () =>
      getPublicQuizzes(QUIZZES_PER_PAGE, (currentPage - 1) * QUIZZES_PER_PAGE),
    staleTime: 5 * 60 * 1000,
  });

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

    return matchesSearch && matchesDifficulty && matchesType;
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
  };

  if (error) {
    return (
      <ProtectedRouteGuard>
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <Zap className="text-destructive h-6 w-6" />
                </div>
                <h3 className="text-destructive mb-2 text-lg font-semibold">
                  Oops! Something went wrong
                </h3>
                <p className="text-destructive/80 mb-4">
                  Failed to load public quizzes. Please try again.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="destructive"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRouteGuard>
    );
  }

  return (
    <ProtectedRouteGuard>
      <div className="from-background via-muted/30 to-muted/50 min-h-screen bg-gradient-to-br">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="hover:bg-accent mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>

            <div className="from-primary to-primary/80 text-primary-foreground relative overflow-hidden rounded-2xl bg-gradient-to-r p-8 shadow-xl">
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary-foreground/20 rounded-xl p-3 backdrop-blur-sm">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold drop-shadow-sm">
                      Public Quizzes
                    </h1>
                    <p className="text-primary-foreground/90 font-medium">
                      Discover amazing quizzes from our community
                    </p>
                  </div>
                </div>
                <div className="text-primary-foreground/90 flex items-center gap-6 text-sm font-medium">
                  <div className="bg-primary-foreground/10 flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>{quizzes.length} quizzes available</span>
                  </div>
                  <div className="bg-primary-foreground/10 flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>AI-powered content</span>
                  </div>
                </div>
              </div>
              <div className="bg-primary-foreground/10 absolute -top-4 -right-4 h-24 w-24 rounded-full" />
              <div className="bg-primary-foreground/5 absolute -bottom-8 -left-8 h-32 w-32 rounded-full" />
            </div>
          </div>

          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search quizzes by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-card/60 border-border/40 focus:bg-card h-11 pl-10"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="text-muted-foreground h-4 w-4" />
                  <span className="text-foreground text-sm font-medium">
                    Filters:
                  </span>
                </div>

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

                <Select
                  value={typeFilter}
                  onValueChange={(value: TypeFilter) => setTypeFilter(value)}
                >
                  <SelectTrigger className="bg-card/60 border-border/40 w-32 backdrop-blur-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ai">✨ AI Made</SelectItem>
                    <SelectItem value="manual">👤 Human Made</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm ||
                  difficultyFilter !== "all" ||
                  typeFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="bg-card/60 border-border/40 backdrop-blur-sm"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Quiz Grid */}
          {!isLoading && (
            <>
              {filteredQuizzes.length === 0 ? (
                <Card className="bg-card/60 border-2 border-dashed backdrop-blur-sm">
                  <CardContent className="pt-12 pb-12">
                    <div className="text-center">
                      <div className="bg-muted mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                        <Brain className="text-muted-foreground h-10 w-10" />
                      </div>
                      <h3 className="text-foreground mb-3 text-xl font-semibold">
                        {searchTerm ||
                        difficultyFilter !== "all" ||
                        typeFilter !== "all"
                          ? "No quizzes match your criteria"
                          : "No public quizzes yet"}
                      </h3>
                      <p className="text-muted-foreground mx-auto mb-6 max-w-sm">
                        {searchTerm ||
                        difficultyFilter !== "all" ||
                        typeFilter !== "all"
                          ? "Try adjusting your search terms or filters to find more quizzes."
                          : "Be the first to create and share a quiz with the community!"}
                      </p>
                      {!(
                        searchTerm ||
                        difficultyFilter !== "all" ||
                        typeFilter !== "all"
                      ) ? (
                        <Link href="/create-quiz">
                          <Button
                            size="lg"
                            className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r"
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Create Your First Quiz
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" onClick={clearFilters}>
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredQuizzes.map((quiz) => {
                    const difficultyConfig = getDifficultyConfig(
                      quiz.difficulty,
                    );

                    return (
                      <Card
                        key={quiz.id}
                        className={cn(
                          "group border-border/50 bg-card/80 cursor-pointer overflow-hidden backdrop-blur-sm transition-all duration-300",
                          "hover:shadow-primary/20 hover:bg-card hover:border-primary/50 hover:scale-[1.02] hover:shadow-xl",
                          "flex h-full flex-col",
                        )}
                      >
                        <CardHeader className="flex-shrink-0 pb-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-foreground group-hover:text-primary line-clamp-2 flex-1 leading-snug font-semibold transition-colors">
                              {quiz.title}
                            </h3>
                          </div>

                          <div className="flex h-10 items-start">
                            {quiz.description ? (
                              <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                                {quiz.description}
                              </p>
                            ) : null}
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
                                  <span
                                    className={cn(
                                      "flex cursor-pointer items-center transition-colors",
                                      difficultyConfig.color,
                                      difficultyConfig.hoverColor,
                                    )}
                                  >
                                    <difficultyConfig.icon className="h-3.5 w-3.5" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="font-medium">
                                    {difficultyConfig.label} Difficulty
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            {quiz.is_ai_generated && (
                              <Badge
                                variant="secondary"
                                className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                              >
                                <Sparkles className="mr-1 h-3 w-3" />
                                AI
                              </Badge>
                            )}
                          </div>

                          <div className="mt-auto">
                            <Link href={`/quiz/${quiz.id}`} className="block">
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
                                <div className="via-foreground/5 absolute inset-0 -translate-x-full -skew-x-12 transform bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                                <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                                <span className="font-medium">Start Quiz</span>
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {filteredQuizzes.length > 0 &&
                quizzes.length === QUIZZES_PER_PAGE && (
                  <div className="mt-12 flex items-center justify-center gap-3">
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

                    <div className="bg-card/60 border-border/40 rounded-lg border px-4 py-2 backdrop-blur-sm">
                      <span className="text-foreground text-sm font-medium">
                        Page {currentPage}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={quizzes.length < QUIZZES_PER_PAGE}
                      className="bg-card/60 border-border/40 backdrop-blur-sm"
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </ProtectedRouteGuard>
  );
}
