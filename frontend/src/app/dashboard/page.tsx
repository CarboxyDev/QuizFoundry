"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, BarChart3, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/app/hooks/auth/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function DashboardContent() {
  const { user, logout } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name || "User"}!
              </p>
            </div>
            <Button variant="outline" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-purple-500 to-sky-500 text-white border-0">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Welcome to your Quiz Hub
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Create, share, and track your quizzes with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create Your First Quiz
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <PlusCircle className="h-8 w-8 mx-auto text-primary" />
                  <CardTitle className="text-lg">Create Quiz</CardTitle>
                  <CardDescription>
                    Generate a new quiz with AI assistance
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto text-primary" />
                  <CardTitle className="text-lg">View Analytics</CardTitle>
                  <CardDescription>
                    Track your quiz performance and insights
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Users className="h-8 w-8 mx-auto text-primary" />
                  <CardTitle className="text-lg">Manage Sharing</CardTitle>
                  <CardDescription>
                    Share quizzes and collaborate with others
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity yet</p>
                  <p className="text-sm">
                    Create your first quiz to get started!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Info */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Profile Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{user?.name || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span>{user?.role || "User"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since:</span>
                    <span>
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
