"use client";

import AuthBackgroundPattern from "@/components/auth/AuthBackgroundPattern";
import FormDivider from "@/components/auth/FormDivider";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import PasswordInput from "@/components/auth/PasswordInput";
import { AuthGuard } from "@/components/AuthGuard";
import { BrandIcon } from "@/components/BrandIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/auth/useAuth";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";
import { useLogin } from "@/hooks/auth/useLogin";
import { isDevelopment } from "@/lib/environment";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState(
    isDevelopment()
      ? {
          email: "dev@carboxy.xyz",
          password: "CarboxyDev123!",
        }
      : {
          email: "",
          password: "",
        },
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginMutation = useLogin();
  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
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
      loginSchema.parse(formData);
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
      const result = await loginMutation.mutateAsync(formData);

      setIsSuccess(true);
      toast.success("Welcome back!");

      // Use auth context instead of direct localStorage
      login(result.data.user, result.data.session);

      // Small delay to show success state before redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: any) {
      // Extract error message from the response
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password. Please try again.";

      toast.error(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    console.log("Forgot password");
    toast.info("Forgot password functionality coming soon!");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const isLoading = loginMutation.isPending;
  const isSubmitDisabled = !isFormValid() || isLoading || isSuccess;

  return (
    <AuthGuard redirectTo="/dashboard">
      <div className="from-background via-muted/20 to-background flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
        <AuthBackgroundPattern />

        <motion.div
          className="relative z-10 w-full max-w-md"
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
            <motion.div
              variants={itemVariants}
              className="space-y-4 text-center"
            >
              <BrandIcon size={60} />
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-muted-foreground">
                  Jump back in to your account and continue creating and taking
                  quizzes
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 shadow-xl">
                <CardContent className="space-y-4 pt-6">
                  <GoogleAuthButton
                    mode="login"
                    onClick={handleGoogleLogin}
                    disabled={isLoading || isSuccess || isGoogleLoading}
                    isLoading={isGoogleLoading}
                  />
                  <FormDivider>Or LOGIN WITH EMAIL</FormDivider>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                      </div>
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
                      {/* <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-primary text-xs transition-colors hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div> */}
                    </div>

                    <Button
                      type="submit"
                      className="h-11 w-full"
                      disabled={isSubmitDisabled}
                    >
                      {isLoading
                        ? "Signing in..."
                        : isSuccess
                          ? "Success! Redirecting..."
                          : "Sign In"}
                    </Button>
                  </form>
                  <p className="text-muted-foreground text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/signup"
                      className="hover:text-primary underline underline-offset-2 transition-colors"
                    >
                      Create one here
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
