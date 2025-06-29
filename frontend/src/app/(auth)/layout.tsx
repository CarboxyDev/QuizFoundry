import { AuthGuard } from "@/components/AuthGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">{children}</div>
    </AuthGuard>
  );
}
