import { ProtectedRouteGuard } from "@/components/AuthGuard";
import { QuizForm } from "./_components/quiz-form";

export default function CreateQuizPage() {
  return (
    <ProtectedRouteGuard>
      <div className="from-background via-muted/10 to-background min-h-screen bg-gradient-to-br">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.08),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.02),transparent_50%)]" />

        <div className="relative z-10">
          <div className="container mx-auto max-w-4xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
            <QuizForm />
          </div>
        </div>
      </div>
    </ProtectedRouteGuard>
  );
}
