"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  Sparkles,
} from "lucide-react";

interface OnboardingData {
  role: string;
  company: string;
  teamSize: string;
  goals: string;
  interests: string[];
  experience: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    role: "",
    company: "",
    teamSize: "",
    goals: "",
    interests: [],
    experience: "",
  });

  const totalSteps = 2;
  const isLastStep = currentStep === totalSteps;
  const isCompleted = currentStep > totalSteps;

  const handleNext = async () => {
    if (isLastStep) {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentStep(currentStep + 1);
      setIsLoading(false);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = () => {
    router.push("/");
  };

  const toggleInterest = (interest: string) => {
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const interests = [
    "Product Design",
    "Development",
    "Marketing",
    "Sales",
    "Analytics",
    "Content Creation",
  ];

  const canProceed = () => {
    if (currentStep === 1) {
      return data.role && data.company && data.teamSize;
    }
    if (currentStep === 2) {
      return data.goals && data.interests.length > 0 && data.experience;
    }
    return false;
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-border bg-card text-center">
          <CardContent className="pt-8 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-8 h-8 text-green-500" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Welcome aboard! 🎉
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-8">
                Your account has been set up successfully. You&apos;re ready to
                get started!
              </CardDescription>

              <Button
                onClick={handleComplete}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              >
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2"
                >
                  Get Started
                  <Sparkles className="w-4 h-4" />
                </motion.span>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border bg-card">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-6">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(
                (step) => (
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
                    {step < totalSteps && (
                      <div
                        className={`w-12 h-0.5 mx-2 transition-colors ${
                          step < currentStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                )
              )}
            </div>

            <CardTitle className="text-xl font-bold text-foreground">
              {currentStep === 1
                ? "Tell us about yourself"
                : "What are your goals?"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {currentStep === 1
                ? "Help us personalize your experience"
                : "Let us know what you want to achieve"}
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="role"
                      className="text-foreground flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      What&apos;s your role?
                    </Label>
                    <Select
                      value={data.role}
                      onValueChange={(value) =>
                        setData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger className="h-12 bg-background border-border">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="product-manager">
                          Product Manager
                        </SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="founder">Founder/CEO</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="company"
                      className="text-foreground flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      Company name
                    </Label>
                    <Input
                      id="company"
                      placeholder="Enter your company name"
                      value={data.company}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          company: e.target.value,
                        }))
                      }
                      className="h-12 bg-background border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamSize" className="text-foreground">
                      Team size
                    </Label>
                    <Select
                      value={data.teamSize}
                      onValueChange={(value) =>
                        setData((prev) => ({ ...prev, teamSize: value }))
                      }
                    >
                      <SelectTrigger className="h-12 bg-background border-border">
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Just me</SelectItem>
                        <SelectItem value="2-5">2-5 people</SelectItem>
                        <SelectItem value="6-20">6-20 people</SelectItem>
                        <SelectItem value="21-100">21-100 people</SelectItem>
                        <SelectItem value="100+">100+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="goals" className="text-foreground">
                    What are your main goals?
                  </Label>
                  <Textarea
                    id="goals"
                    placeholder="Tell us what you want to achieve..."
                    value={data.goals}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, goals: e.target.value }))
                    }
                    className="min-h-24 bg-background border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">
                    What interests you most?
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant={
                          data.interests.includes(interest)
                            ? "default"
                            : "outline"
                        }
                        className={`cursor-pointer transition-colors ${
                          data.interests.includes(interest)
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-border hover:bg-muted"
                        }`}
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-foreground">
                    Experience level
                  </Label>
                  <Select
                    value={data.experience}
                    onValueChange={(value) =>
                      setData((prev) => ({ ...prev, experience: value }))
                    }
                  >
                    <SelectTrigger className="h-12 bg-background border-border">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">
                        Beginner (0-1 years)
                      </SelectItem>
                      <SelectItem value="intermediate">
                        Intermediate (2-4 years)
                      </SelectItem>
                      <SelectItem value="experienced">
                        Experienced (5-7 years)
                      </SelectItem>
                      <SelectItem value="expert">Expert (8+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 h-12 border-border hover:bg-muted text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className={`h-12 bg-primary hover:bg-primary/90 text-primary-foreground ${
                currentStep === 1 ? "w-full" : "flex-1"
              }`}
            >
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2"
              >
                {isLoading
                  ? "Setting up..."
                  : isLastStep
                    ? "Complete Setup"
                    : "Next"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </motion.span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
