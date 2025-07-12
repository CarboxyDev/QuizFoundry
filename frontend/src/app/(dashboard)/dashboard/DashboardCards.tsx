import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

export function DashboardCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="text-primary h-5 w-5" />
            Browse Quizzes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            Explore public quizzes created by the community.
          </p>
          <Link href="/public-quizzes">
            <Button variant="outline" className="w-full">
              Browse All
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="text-primary h-5 w-5" />
            My Quizzes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            View and manage all the quizzes you&apos;ve created.
          </p>
          <Link href="/my-quizzes">
            <Button variant="outline" className="w-full">
              View My Quizzes
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            Create Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            Generate intelligent quizzes with AI on any topic in seconds.
          </p>
          <Link href="/create-quiz">
            <Button variant="default" className="w-full">
              Create Quiz
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            Create AI Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Generate intelligent quizzes on any topic using our advanced AI.
            Just provide a topic and let our AI create engaging questions for
            you.
          </p>
          <Link href="/create-quiz">
            <Button className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Create AI Quiz
            </Button>
          </Link>
        </CardContent>
      </Card> */}
    </div>
  );
}
