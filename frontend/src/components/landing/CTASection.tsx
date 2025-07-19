"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Stat } from "@/types/landing";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { memo } from "react";

const stats: Stat[] = [
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
    label: "Analytics",
    description: "Real-time performance insights",
    icon: BarChart3,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

const ctaFeatures = [
  {
    icon: CheckCircle,
    text: "AI Generation in 15 seconds",
    colorClass: "text-green-500",
    bgClass: "bg-green-500/20",
  },
  {
    icon: CheckCircle,
    text: "Advanced analytics & insights",
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500/20",
  },
  {
    icon: CheckCircle,
    text: "Public & private sharing",
    colorClass: "text-purple-500",
    bgClass: "bg-purple-500/20",
  },
  {
    icon: CheckCircle,
    text: "Manual editing capabilities",
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/20",
  },
];

export const CTASection = memo(() => {
  return (
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
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {stats.map((stat) => (
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
                    <div className="mb-2 text-4xl font-bold">{stat.number}</div>
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
                    quiz experiences, and comprehensive analytics to track every
                    aspect of performance.
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
                        {ctaFeatures.map((feature) => (
                          <div
                            key={feature.text}
                            className="flex items-center gap-3"
                          >
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-full",
                                feature.bgClass,
                              )}
                            >
                              <feature.icon
                                className={cn("h-6 w-6", feature.colorClass)}
                              />
                            </div>
                            <span className="font-medium">{feature.text}</span>
                          </div>
                        ))}
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
  );
});

CTASection.displayName = "CTASection";
