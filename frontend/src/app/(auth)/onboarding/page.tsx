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
import { useCompleteOnboarding } from "@/app/hooks/auth/useOnboarding";
import type { OnboardingData } from "@shared/types/api";

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

  const handleSkip = () => {
    router.push("/dashboard");
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

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Onboarding Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8 lg:p-12"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="w-full max-w-md">
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
            {/* Header */}
            <motion.div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome to QuizAI
              </h1>
              <p className="text-muted-foreground">
                Let's personalize your experience in just 2 steps
              </p>
            </motion.div>

            {/* Progress Indicator */}
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

            {/* Step Content */}
            <Card className="border-2">
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
                    <CardHeader className="space-y-1 pb-4">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <User className="h-6 w-6" />
                        What's your name?
                      </CardTitle>
                      <CardDescription>
                        Help us personalize your experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name*</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="pl-10"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSkip}
                          className="flex-1"
                        >
                          Skip for now
                        </Button>
                        <Button
                          onClick={handleNext}
                          className="flex-1"
                          disabled={!formData.name.trim()}
                        >
                          Next
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <CardHeader className="space-y-1 pb-4">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        What's your role?
                        <Button
                          onClick={handleBack}
                          className="ml-auto p-1 hover:bg-muted rounded-lg transition-colors"
                          variant="ghost"
                          title="Go back"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        This helps us customize your quiz experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        {roleOptions.map((option) => {
                          const IconComponent = option.icon;
                          const isSelected = formData.role === option.value;
                          return (
                            <div
                              key={option.value}
                              onClick={() =>
                                setFormData({ ...formData, role: option.value })
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
                          onClick={handleSkip}
                          className="flex-1"
                        >
                          Skip for now
                        </Button>
                        <Button
                          onClick={handleComplete}
                          className="flex-1"
                          disabled={completeOnboardingMutation.isPending}
                        >
                          {completeOnboardingMutation.isPending
                            ? "Completing..."
                            : "Complete"}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                )}
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Welcome Message */}
      <motion.div
        className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-12"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        <div className="max-w-lg text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-sky-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold">
              You're almost{" "}
              <span className="bg-gradient-to-r from-purple-500 to-sky-500 bg-clip-text text-transparent">
                ready!
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Just a couple quick questions to personalize your quiz creation
              experience and get you started on the right foot.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-sm text-muted-foreground"
          >
            You can always update these preferences later in your settings
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
