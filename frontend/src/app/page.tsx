"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Check,
  CheckCircle,
  Edit3,
  Globe,
  Play,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 },
};

const gradientAnimation = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
  },
  transition: {
    duration: 8,
    repeat: Infinity,
  },
};

export default function HomePage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Generation",
      description:
        "Create comprehensive quizzes instantly with an AI that understands context and difficulty.",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: BookOpen,
      title: "Public Quizzes",
      description:
        "Access a plethora of quizzes on different topics created by other users with the help of AI.",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      icon: BarChart3,
      title: "Deep Analytics",
      description:
        "Track performance, identify weak spots, and gain insights from detailed quiz analytics.",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: Wand2,
      title: "Manual Tweaking Support",
      description:
        "Create AI prototypes then edit every question, answer, and setting to perfection.",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      icon: Globe,
      title: "Public & Private",
      description:
        "Share your quizzes publicly or keep them private for personal use and testing.",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      icon: Bot,
      title: "Smart AI Validation",
      description:
        "Our AI validates public quizzes for quality assurance and spam prevention.",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="from-background via-muted/20 to-background relative min-h-screen bg-gradient-to-br">
      {/* Textured background */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0), 
                           radial-gradient(circle at 1px 1px, rgba(var(--primary),0.1) 1px, transparent 0)`,
          backgroundSize: "32px 32px, 48px 48px",
          backgroundPosition: "0 0, 16px 16px",
        }}
      />

      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="from-primary/3 via-primary/1 absolute inset-0 bg-gradient-to-b to-transparent" />
        <div className="via-primary/2 absolute inset-0 bg-gradient-to-r from-transparent to-transparent" />
        <motion.div
          className="relative mx-auto max-w-7xl text-center"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Create & Take Smart Quizzes
              <br />
              <motion.span
                className="from-primary via-primary/80 to-primary/60 bg-gradient-to-r bg-[length:200%_100%] bg-clip-text text-transparent"
                animate={gradientAnimation.animate}
                transition={gradientAnimation.transition}
                style={{
                  textShadow: "0 0 30px hsl(var(--primary) / 0.4)",
                }}
              >
                with Deep Analytics
              </motion.span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl sm:text-2xl">
              Generate quizzes instantly with AI, take quizzes seamlessly, and
              analyze performance with detailed insights. Create public or
              private quizzes and track every metric that matters.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className={cn(
                  "group relative h-14 px-8 text-lg font-semibold",
                  "bg-primary hover:bg-primary/90",
                  "hover:shadow-primary/25 shadow-lg hover:shadow-xl",
                  "transform transition-all duration-200 hover:-translate-y-0.5",
                  "border-0",
                )}
              >
                <span className="flex items-center">
                  Try It Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "group relative h-14 px-8 text-lg font-semibold backdrop-blur-sm",
                "bg-background/80 border-primary/20 hover:border-primary/40 border-2",
                "hover:bg-primary/5",
                "shadow-lg hover:shadow-xl",
                "transform transition-all duration-200 hover:-translate-y-0.5",
              )}
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <span className="flex items-center">
                <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                See How It Works
              </span>
            </Button>
          </motion.div>

          <motion.div variants={scaleIn} className="relative mx-auto max-w-4xl">
            <div className="bg-card/60 relative rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
              <div className="border-muted-foreground/20 bg-muted/30 flex aspect-video w-full items-center justify-center rounded-xl border-2 border-dashed">
                <div className="text-center">
                  <div className="bg-muted-foreground/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Brain className="text-muted-foreground/60 h-8 w-8" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Demo Image Placeholder
                  </p>
                  <p className="text-muted-foreground/60 text-xs">
                    Show QuizFoundry in action
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-7xl"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">
              Everything You Need for the Complete Quiz Experience
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              From AI-powered quiz generation to detailed performance analytics,
              we&apos;ve got every aspect of quiz creation and participation
              covered.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp} className="group">
                <Card className="bg-card/60 hover:bg-card/80 h-full backdrop-blur-sm transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className={cn("rounded-lg p-2", feature.bg)}>
                        <feature.icon
                          className={cn("h-6 w-6", feature.color)}
                        />
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-7xl"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">
              Choose Your Perfect Mode
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Two powerful creation modes designed for different needs. From
              lightning-fast generation to detailed customization.
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid h-[600px] gap-6 lg:grid-cols-12 lg:grid-rows-8">
            {/* Express Mode - Large card */}
            <motion.div
              variants={fadeInUp}
              className="group lg:col-span-7 lg:row-span-8"
            >
              <Card className="bg-card/60 hover:bg-card/80 h-full backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                <CardContent className="flex h-full flex-col p-8">
                  <div className="mb-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-xl bg-blue-500/10 p-3">
                        <Zap className="h-8 w-8 text-blue-500" />
                      </div>
                      <h3 className="mb-3 text-3xl font-bold">Express Mode</h3>
                    </div>

                    <p className="text-muted-foreground text-lg">
                      Lightning fast AI generation for instant quiz creation
                    </p>
                  </div>

                  <div className="flex-1 space-y-4">
                    {[
                      "AI generates 5 questions instantly",
                      "Medium difficulty questions by default",
                      "One-click creation",
                      "Perfect for quick quizzes",
                      "Ability to edit later",
                    ].map((feature, index) => (
                      <div key={feature} className="flex items-center gap-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500">
                        ~15 seconds
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Average creation time
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Advanced Mode Card */}
            <motion.div
              variants={fadeInUp}
              className="group lg:col-span-5 lg:row-span-4"
            >
              <Card className="bg-card/60 hover:bg-card/80 h-full backdrop-blur-sm transition-all duration-300">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-purple-500/10 p-3">
                        <Wand2 className="h-6 w-6 text-purple-500" />
                      </div>
                      <h3 className="text-2xl font-bold">Advanced Mode</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Full control with AI power and customization
                    </p>
                  </div>

                  <div className="flex-1 space-y-3">
                    {[
                      "Set question count and difficulty level",
                      "Choose number of options per question",
                      "Optional manual editing mode",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                        <span className="text-sm leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Manual Mode Card */}
            <motion.div
              variants={fadeInUp}
              className="group lg:col-span-5 lg:row-span-4"
            >
              <Card className="bg-card/60 hover:bg-card/80 h-full backdrop-blur-sm transition-all duration-300">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-amber-500/10 p-3">
                        <Edit3 className="h-6 w-6 text-amber-500" />
                      </div>
                      <h3 className="text-2xl font-bold">Manual Mode</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Get AI prototype then customize before publishing
                    </p>
                  </div>

                  <div className="flex-1 space-y-3">
                    {[
                      "AI creates a quiz prototype for you to edit",
                      "Full quiz editing interface",
                      "Perfect for manually curated quizzes",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                        <span className="text-sm leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-7xl"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">
              How It Works
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              From idea to insight in just a few simple steps. Create, take, and
              analyze your quizzes and attempts with comprehensive performance
              tracking.
            </p>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-5 lg:gap-8">
            {[
              {
                step: "1",
                title: "Choose Mode",
                description:
                  "Pick Express for speed or Advanced for customization",
                icon: Zap,
              },
              {
                step: "2",
                title: "Configure Settings",
                description:
                  "Set topic, visibility, and advanced options if needed",
                icon: Settings2,
              },
              {
                step: "3",
                title: "Generate Quiz",
                description:
                  "AI instantly creates a quiz for you with your settings",
                icon: Brain,
              },
              {
                step: "4",
                title: "Manage & Share",
                description:
                  "Access via My Quizzes, share links, or edit anytime",
                icon: Globe,
              },
              {
                step: "5",
                title: "Track Performance",
                description:
                  "View creator analytics and personal progress insights",
                icon: TrendingUp,
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                variants={fadeInUp}
                className="relative text-center lg:text-left"
              >
                <div className="mb-4 flex justify-center lg:justify-start">
                  <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
                    <step.icon className="h-8 w-8" />
                  </div>
                </div>
                <div className="text-primary mb-2 text-sm font-medium">
                  Step {step.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < 4 && (
                  <div className="from-primary/20 absolute top-8 -right-4 hidden h-0.5 w-8 bg-gradient-to-r to-transparent lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-6xl"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
              Ready to Elevate Your Quiz Experience?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
              Join educators, trainers, and quiz enthusiasts who are creating,
              taking, and analyzing smarter quizzes with the power of AI and
              comprehensive analytics.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="mb-12">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  number: "100+",
                  label: "Quizzes Created",
                  description: "AI-powered quizzes generated",
                  icon: Brain,
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  number: "500+",
                  label: "Quiz Attempts",
                  description: "Quizzes completed by users",
                  icon: Target,
                  color: "text-green-500",
                  bg: "bg-green-500/10",
                },
                {
                  number: "10+",
                  label: "Analytics Access",
                  description: "Real-time performance insights",
                  icon: BarChart3,
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <Card className="bg-card/60 hover:bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-8">
                      <div className="mb-4 flex justify-center">
                        <div className={cn("rounded-xl p-3", stat.bg)}>
                          <stat.icon className={cn("h-8 w-8", stat.color)} />
                        </div>
                      </div>
                      <div className="mb-2 text-4xl font-bold">
                        {stat.number}
                      </div>
                      <div className="mb-2 text-lg font-semibold">
                        {stat.label}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {stat.description}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Card */}
          <motion.div variants={fadeInUp}>
            <Card className="from-primary/5 via-primary/10 to-primary/5 overflow-hidden bg-gradient-to-r backdrop-blur-sm">
              <CardContent className="p-8 lg:p-12">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                  <div className="text-center lg:text-left">
                    <div className="bg-primary/10 text-primary mb-4 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Absolutely Free
                    </div>
                    <h3 className="mb-4 text-3xl font-bold tracking-tight">
                      Start Your Complete Quiz Journey Today
                    </h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      Get instant access to AI-powered quiz generation, seamless
                      quiz experiences, and comprehensive analytics to track
                      every aspect of performance.
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                      <Link href="/signup">
                        <Button
                          size="lg"
                          className="group bg-primary hover:bg-primary/90 h-14 px-8 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                        >
                          Get Started
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                      <Link href="/public-quizzes">
                        <Button
                          variant="outline"
                          size="lg"
                          className="h-14 px-8 text-lg font-semibold backdrop-blur-sm"
                        >
                          <Users className="mr-2 h-5 w-5" />
                          Browse Public Quizzes
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="bg-primary/20 absolute -inset-4 rounded-full blur-xl"></div>
                      <div className="bg-card/80 relative rounded-2xl p-6 backdrop-blur-sm">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                            <span className="font-medium">
                              AI Generation in 15 seconds
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                              <CheckCircle className="h-6 w-6 text-blue-500" />
                            </div>
                            <span className="font-medium">
                              Advanced analytics & insights
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                              <CheckCircle className="h-6 w-6 text-purple-500" />
                            </div>
                            <span className="font-medium">
                              Public & private sharing
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                              <CheckCircle className="h-6 w-6 text-amber-500" />
                            </div>
                            <span className="font-medium">
                              Manual editing capabilities
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-card/30 border-t px-4 py-12 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="QuizFoundry" width={40} height={40} />
              <span className="text-primary text-lg font-semibold">
                QuizFoundry
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 QuizFoundry. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
