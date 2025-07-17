"use client";

import { DashboardCards } from "@/app/(dashboard)/dashboard/DashboardCards";
import { GettingStarted } from "@/app/(dashboard)/dashboard/GettingStarted";
import { useAuth } from "@/hooks/auth/useAuth";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="mb-2 text-3xl font-bold tracking-tight">
              Welcome back, {user?.name || "there"}!
            </h2>
            <p className="text-muted-foreground">
              Ready to create and take some amazing AI-powered quizzes?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GettingStarted />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <DashboardCards />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
