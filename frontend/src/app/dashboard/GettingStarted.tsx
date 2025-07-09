import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GettingStarted() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Getting Started</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
              1
            </div>
            <div>
              <h4 className="font-medium">Create a Quiz</h4>
              <p className="text-muted-foreground text-sm">
                Start by creating your first AI-powered quiz on any topic.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
              2
            </div>
            <div>
              <h4 className="font-medium">Share & Play</h4>
              <p className="text-muted-foreground text-sm">
                Share your quiz with others or explore community quizzes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
              3
            </div>
            <div>
              <h4 className="font-medium">Track Progress</h4>
              <p className="text-muted-foreground text-sm">
                Monitor performance and see detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
