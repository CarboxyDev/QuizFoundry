"use client";

import { ErrorDetailsDialog } from "@/components/ui/enhanced-toast";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/auth/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={60000}
          toastOptions={{
            style: {
              fontSize: "14px",
            },
          }}
        />
        <ErrorDetailsDialog />
      </AuthProvider>
    </QueryClientProvider>
  );
}
