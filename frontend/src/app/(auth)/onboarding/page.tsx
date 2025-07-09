"use client";

import { OnboardingGuard } from "@/components/OnboardingGuard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompleteOnboarding } from "@/hooks/auth/useOnboarding";
import type { OnboardingData } from "@backend/types/api";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const roleOptions = [
  {
    value: "education",
    label: "Education",
    description: "Learning, teaching, or academic use",
    icon: GraduationCap,
  },
  {
    value: "casual",
    label: "Casual",
    description: "Just exploring and having fun",
    icon: Users,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    role: "",
  });

  const completeOnboardingMutation = useCompleteOnboarding();

  const handleNext = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!formData.role) {
      toast.error("Please select your role");
      return;
    }

    try {
      await completeOnboardingMutation.mutateAsync(formData);

      toast.success("Welcome aboard! Your account is ready.");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to complete onboarding. Please try again.";

      toast.error(errorMessage);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <OnboardingGuard>
      <div className="from-background via-muted/20 to-background flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.1),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.03),transparent_25%)]" />

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
            {/* Header Section */}
            <motion.div
              variants={itemVariants}
              className="space-y-4 text-center"
            >
              <div className="from-primary/20 to-primary/10 border-primary/20 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-gradient-to-br">
                <Sparkles className="text-primary h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome to QuizAI
                </h1>
                <p className="text-muted-foreground text-lg">
                  Let&apos;s get your account set up in just 2 steps
                </p>
              </div>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-center space-x-2">
                {[1, 2].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                        step <= currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 2 && (
                      <div
                        className={`mx-2 h-0.5 w-8 transition-colors ${
                          step < currentStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Form Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 shadow-xl">
                <motion.div
                  key={currentStep}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <>
                      <CardHeader className="space-y-1 pb-4 text-center">
                        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                          <User className="h-6 w-6" />
                          What&apos;s your name?
                        </CardTitle>
                        <CardDescription>
                          Help us personalize your experience
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Form
                          onSubmit={handleNext}
                          disabled={!formData.name.trim()}
                          className="space-y-6"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name*</Label>
                            <div className="relative">
                              <User className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                              <Input
                                id="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    name: e.target.value,
                                  })
                                }
                                className="pl-10"
                                autoFocus
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={
                              !formData.name.trim() ||
                              completeOnboardingMutation.isPending ||
                              completeOnboardingMutation.isSuccess
                            }
                          >
                            Continue
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Form>
                      </CardContent>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <CardHeader className="space-y-1 pb-4 text-center">
                        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                          <Users className="h-6 w-6" />
                          What&apos;s your role?
                        </CardTitle>
                        <CardDescription>
                          This helps us customize your quiz experience
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Form
                          onSubmit={handleComplete}
                          disabled={
                            !formData.role ||
                            completeOnboardingMutation.isPending
                          }
                          className="space-y-6"
                        >
                          <div className="space-y-4">
                            {roleOptions.map((option, index) => {
                              const IconComponent = option.icon;
                              const isSelected = formData.role === option.value;

                              const handleSelect = () => {
                                setFormData({
                                  ...formData,
                                  role: option.value,
                                });
                              };

                              const handleKeyDown = (
                                e: React.KeyboardEvent,
                              ) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleSelect();
                                }
                              };

                              return (
                                <motion.div
                                  key={option.value}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  onClick={handleSelect}
                                  onKeyDown={handleKeyDown}
                                  tabIndex={0}
                                  role="button"
                                  aria-pressed={isSelected}
                                  className={`group focus:ring-primary relative cursor-pointer overflow-hidden rounded-xl border-2 p-5 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                                    isSelected
                                      ? "border-primary from-primary/10 via-primary/5 to-primary/10 shadow-primary/10 bg-gradient-to-br shadow-lg"
                                      : "border-border bg-card hover:border-primary/30 hover:from-primary/5 hover:bg-gradient-to-br hover:to-transparent hover:shadow-md"
                                  }`}
                                >
                                  {/* Background gradient overlay for selected state */}
                                  {isSelected && (
                                    <div className="from-primary/5 to-primary/5 absolute inset-0 bg-gradient-to-r via-transparent opacity-50" />
                                  )}

                                  <div className="relative flex items-center space-x-4">
                                    <div
                                      className={`flex-shrink-0 rounded-lg p-2 transition-colors ${
                                        isSelected
                                          ? "bg-primary/15 text-primary"
                                          : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                      }`}
                                    >
                                      <IconComponent className="h-6 w-6" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div
                                        className={`text-lg font-semibold transition-colors ${
                                          isSelected
                                            ? "text-primary"
                                            : "text-foreground group-hover:text-primary"
                                        }`}
                                      >
                                        {option.label}
                                      </div>
                                      <div
                                        className={`text-sm transition-colors ${
                                          isSelected
                                            ? "text-primary/70"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        {option.description}
                                      </div>
                                    </div>

                                    {/* Selection indicator */}
                                    <div
                                      className={`flex-shrink-0 transition-all duration-200 ${
                                        isSelected
                                          ? "scale-100 opacity-100"
                                          : "scale-75 opacity-0"
                                      }`}
                                    >
                                      <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full">
                                        <svg
                                          className="h-3 w-3"
                                          viewBox="0 0 12 12"
                                          fill="currentColor"
                                        >
                                          <path
                                            d="M10 3L4.5 8.5L2 6"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="none"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>

                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleBack}
                              className="flex-1"
                              disabled={
                                completeOnboardingMutation.isPending ||
                                completeOnboardingMutation.isSuccess
                              }
                            >
                              <ArrowLeft className="mr-2 h-4 w-4" />
                              Back
                            </Button>
                            <Button
                              type="submit"
                              className="flex-1"
                              disabled={
                                completeOnboardingMutation.isPending ||
                                completeOnboardingMutation.isSuccess ||
                                !formData.role
                              }
                            >
                              {completeOnboardingMutation.isPending
                                ? "Setting up..."
                                : completeOnboardingMutation.isSuccess
                                  ? "Redirecting..."
                                  : "Complete Setup"}
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </Form>
                      </CardContent>
                    </>
                  )}
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </OnboardingGuard>
  );
}
