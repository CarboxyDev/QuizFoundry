"use client";

import { ProtectedRouteGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicQuizzes } from "@/lib/quiz-api";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const QUIZZES_PER_PAGE = 12;

export default function PublicQuizzesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: quizzes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-quizzes", currentPage],
    queryFn: () =>
      getPublicQuizzes(QUIZZES_PER_PAGE, (currentPage - 1) * QUIZZES_PER_PAGE),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (error) {
    return (
      <ProtectedRouteGuard>
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4 text-lg">
                  Failed to load public quizzes. Please try again.
                </p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRouteGuard>
    );
  }

  return (
    <ProtectedRouteGuard>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="mb-2 flex items-center gap-3">
            <Users className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold">Public Quizzes</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover and take quizzes created by the community
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
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
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Brain className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-semibold">
                      {searchTerm
                        ? "No quizzes found"
                        : "No public quizzes yet"}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Be the first to create and share a quiz with the community!"}
                    </p>
                    {!searchTerm && (
                      <Link href="/create-quiz">
                        <Button className="mt-4">Create Your First Quiz</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredQuizzes.map((quiz) => (
                  <Card
                    key={quiz.id}
                    className="group cursor-pointer transition-shadow hover:shadow-lg"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="group-hover:text-primary line-clamp-2 text-lg transition-colors">
                          {quiz.title}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`ml-2 capitalize ${getDifficultyColor(quiz.difficulty)}`}
                        >
                          {quiz.difficulty}
                        </Badge>
                      </div>
                      {quiz.description && (
                        <p className="text-muted-foreground line-clamp-2 text-sm">
                          {quiz.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-muted-foreground mb-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            {quiz.questions?.length || 0} questions
                          </span>
                          {quiz.is_ai_generated && (
                            <span className="flex items-center gap-1 text-blue-600">
                              ✨ AI Generated
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {formatDate(quiz.created_at)}
                        </span>
                        <Link href={`/quiz/${quiz.id}`}>
                          <Button size="sm" className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            Take Quiz
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredQuizzes.length > 0 &&
              quizzes.length === QUIZZES_PER_PAGE && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-muted-foreground px-4 text-sm">
                    Page {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={quizzes.length < QUIZZES_PER_PAGE}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
          </>
        )}
      </div>
    </ProtectedRouteGuard>
  );
}
