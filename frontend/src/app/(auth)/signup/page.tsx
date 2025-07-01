"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import { Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSignup } from "@/app/hooks/auth/useSignup";
import { useAuth } from "@/app/hooks/auth/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const signupMutation = useSignup();

  const validateForm = () => {
    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const isFormValid = () => {
    try {
      signupSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await signupMutation.mutateAsync(formData);

      setIsSuccess(true);
      toast.success("Account created successfully! Let's get you set up.");

      // Use auth context to log in the user with the session data
      login(result.data.user, result.data.session);

      // Small delay to show success state before redirect
      setTimeout(() => {
        router.push("/onboarding");
      }, 1500);
    } catch (error: any) {
      // Extract error message from the response
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create account. Please try again.";

      toast.error(errorMessage);
    }
  };

  const handleGoogleSignUp = () => {
    // TODO: Implement Google sign-up
    console.log("Google sign up");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const isLoading = signupMutation.isPending;
  const isSubmitDisabled = !isFormValid() || isLoading || isSuccess;

  return (
    <AuthGuard redirectTo="/dashboard">
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.1),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.03),transparent_25%)]" />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{
              staggerChildren: 0.1,
              duration: 0.6,
            }}
            className="space-y-8"
          >
            {/* Header Section */}
            <motion.div
              variants={itemVariants}
              className="text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  Create Your Account
                </h1>
                <p className="text-muted-foreground text-lg">
                  Join thousands of creators building amazing quizzes
                </p>
              </div>
            </motion.div>

            {/* Form Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 shadow-xl">
                <CardContent className="space-y-4 pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email*</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          placeholder="Enter your email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password*</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          placeholder="Create a password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-500">
                          {errors.password}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={isSubmitDisabled}
                    >
                      {isLoading
                        ? "Creating account..."
                        : isSuccess
                          ? "Account created!"
                          : "Create Account"}
                    </Button>
                  </form>

                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="px-2 text-muted-foreground bg-card">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleGoogleSignUp}
                    className="w-full h-11"
                    disabled={isLoading || isSuccess}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign up with Google
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="underline underline-offset-4 hover:text-primary transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              className="text-center text-sm text-muted-foreground"
            >
              <p>
                By creating an account, you agree to our{" "}
                <Link
                  href="#"
                  className="underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
