"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  GraduationCap,
  Users,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useCompleteOnboarding } from "@/hooks/auth/useOnboarding";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import type { OnboardingData } from "@backend/types/api";
import { Form } from "@/components/ui/form";

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
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        step <= currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 2 && (
                      <div
                        className={`w-8 h-0.5 mx-2 transition-colors ${
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
                      <CardHeader className="text-center space-y-1 pb-4">
                        <CardTitle className="text-2xl flex items-center justify-center gap-2">
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
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                      <CardHeader className="text-center space-y-1 pb-4">
                        <CardTitle className="text-2xl flex items-center justify-center gap-2">
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
                          <div className="space-y-3">
                            {roleOptions.map((option) => {
                              const IconComponent = option.icon;
                              const isSelected = formData.role === option.value;
                              return (
                                <div
                                  key={option.value}
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      role: option.value,
                                    })
                                  }
                                  className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-accent ${
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-muted"
                                  }`}
                                >
                                  <div className="flex-shrink-0">
                                    <IconComponent
                                      className={`h-5 w-5 ${
                                        isSelected
                                          ? "text-primary"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`font-medium ${
                                        isSelected ? "text-primary" : ""
                                      }`}
                                    >
                                      {option.label}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {option.description}
                                    </div>
                                  </div>
                                </div>
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
