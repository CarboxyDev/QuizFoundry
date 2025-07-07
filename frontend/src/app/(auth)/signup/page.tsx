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
import { useSignup } from "@/hooks/auth/useSignup";
import { useAuth } from "@/hooks/auth/useAuth";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { toast } from "sonner";
import { z } from "zod";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import PasswordInput from "@/components/auth/PasswordInput";
import FormDivider from "@/components/auth/FormDivider";

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
  const { signUpWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();

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

  const handleGoogleSignUp = async () => {
    await signUpWithGoogle();
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
  const isSubmitDisabled =
    !isFormValid() || isLoading || isSuccess || isGoogleLoading;

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
                  Create Your QuizForge Account
                </h1>
                <p className="text-muted-foreground text-lg">
                  Start creating amazing quizzes in seconds
                </p>
              </div>
            </motion.div>

            {/* Form Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 shadow-xl">
                <CardContent className="space-y-4 pt-6">
                  <GoogleAuthButton
                    mode="signup"
                    onClick={handleGoogleSignUp}
                    disabled={isLoading || isSuccess || isGoogleLoading}
                    isLoading={isGoogleLoading}
                  />
                  <FormDivider>Or continue with email</FormDivider>
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
                      <PasswordInput
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        required
                        error={errors.password}
                      />
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
          </motion.div>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
