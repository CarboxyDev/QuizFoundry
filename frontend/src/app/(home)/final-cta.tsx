"use client";

import { Button } from "@/components/ui/button";
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
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight lg:text-5xl">
            <span className="from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text">
              Ready to Elevate Your
            </span>
            <br />
            <span className="from-primary bg-gradient-to-r to-orange-500 bg-clip-text text-transparent">
              Quiz Experience?
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
            Join educators, trainers, and quiz enthusiasts who are
            <span className="text-foreground font-semibold">
              creating, taking, and analyzing
            </span>{" "}
            smarter quizzes with the power of
            <span className="text-foreground font-semibold">
              AI and comprehensive analytics
            </span>
            .
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
                <div className="group/stat relative">
                  <div className="from-primary/25 absolute inset-0 rounded-2xl bg-gradient-to-br to-orange-500/25 opacity-0 blur-xl transition-all duration-500 group-hover/stat:opacity-100" />
                  <div className="hover:border-primary/40 relative rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-8 text-center shadow-lg transition-all duration-200 hover:shadow-xl">
                    <div className="from-primary/5 absolute inset-0 rounded-2xl bg-gradient-to-br via-transparent to-orange-500/5 opacity-0 transition-opacity duration-300 group-hover/stat:opacity-100" />
                    <div className="relative z-10">
                      <div className="mb-6 flex justify-center">
                        <div
                          className={cn(
                            "rounded-2xl p-4 shadow-lg transition-all duration-300 group-hover/stat:scale-110 group-hover/stat:shadow-xl",
                            stat.bg,
                          )}
                        >
                          <stat.icon
                            className={cn(
                              "h-10 w-10 transition-all duration-300",
                              stat.color,
                            )}
                          />
                        </div>
                      </div>
                      <div className="from-primary mb-3 bg-gradient-to-r to-orange-500 bg-clip-text text-4xl font-bold text-transparent">
                        {stat.number}
                      </div>
                      <div className="text-foreground mb-3 text-lg font-bold">
                        {stat.label}
                      </div>
                      <div className="text-muted-foreground text-sm leading-relaxed">
                        {stat.description}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-900/70 shadow-2xl">
            <div className="from-primary/10 absolute inset-0 bg-gradient-to-br via-orange-500/5 to-transparent opacity-60" />
            <div className="relative z-10 p-8 lg:p-12">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                <div className="text-center lg:text-left">
                  <motion.div
                    className="from-primary/20 text-primary border-primary/30 mb-6 inline-flex items-center rounded-full border bg-gradient-to-r to-orange-500/20 px-6 py-3 text-sm font-bold shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Absolutely Free
                  </motion.div>
                  <h3 className="mb-6 text-3xl font-bold tracking-tight lg:text-4xl">
                    <span className="from-primary bg-gradient-to-r to-orange-500 bg-clip-text text-transparent">
                      Start Your Complete Quiz Journey Today
                    </span>
                  </h3>
                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    Get instant access to{" "}
                    <span className="text-foreground font-semibold">
                      AI-powered quiz generation
                    </span>
                    , seamless quiz experiences, and{" "}
                    <span className="text-foreground font-semibold">
                      comprehensive analytics
                    </span>{" "}
                    to track every aspect of performance.
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                    <Link href="/signup">
                      <Button
                        size="lg"
                        className="group bg-primary hover:bg-primary/90 hover:shadow-primary/25 h-16 rounded-full px-10 text-lg font-bold shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                      >
                        <span className="flex items-center">
                          <Sparkles className="mr-2 h-5 w-5" />
                          Get Started
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>
                    </Link>
                    <Link href="/public-quizzes">
                      <Button
                        variant="outline"
                        size="lg"
                        className="group border-primary/30 hover:border-primary/60 hover:bg-primary/10 hover:text-primary h-16 rounded-full border-2 px-10 text-lg font-semibold shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl"
                      >
                        <Users className="mr-2 h-5 w-5" />
                        Browse Public Quizzes
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="from-primary/30 absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r to-orange-500/30 blur-2xl"></div>
                    <motion.div
                      className="relative rounded-2xl border border-zinc-700/60 bg-zinc-800/80 p-8 shadow-lg"
                      initial={{ scale: 0.9, opacity: 0.8 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="from-primary/10 absolute inset-0 rounded-2xl bg-gradient-to-br via-transparent to-orange-500/10 opacity-50" />
                      <div className="relative z-10 space-y-6">
                        {ctaFeatures.map((feature, index) => (
                          <motion.div
                            key={feature.text}
                            className="flex items-center gap-4"
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                          >
                            <div
                              className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg",
                                feature.bgClass,
                              )}
                            >
                              <feature.icon
                                className={cn("h-6 w-6", feature.colorClass)}
                              />
                            </div>
                            <span className="text-foreground text-lg font-semibold">
                              {feature.text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
});

CTASection.displayName = "CTASection";
