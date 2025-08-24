import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, FileText, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export function DashboardCards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="text-primary h-5 w-5" />
              Public Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Explore public quizzes created by the community.
            </p>
            <Link href="/public-quizzes">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="w-full">
                  View Public Quizzes
                </Button>
              </motion.div>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-primary h-5 w-5" />
              My Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              View and manage all the quizzes you&apos;ve created.
            </p>
            <Link href="/my-quizzes">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="w-full">
                  View My Quizzes
                </Button>
              </motion.div>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-primary h-5 w-5" />
              Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Track your quiz performance and insights.
            </p>
            <Link href="/analytics">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </motion.div>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={cardVariants}
        whileHover={{ 
          scale: 1.01,
          transition: { duration: 0.2 }
        }}
        className="col-span-full"
      >
        <Card className="bg-gradient-to-r from-primary/3 to-primary/8 border-primary/10 hover:shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <motion.div 
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0"
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.2 }
                }}
              >
                <Sparkles className="text-primary h-6 w-6" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold">Create AI-Powered Quiz</h3>
                <p className="text-muted-foreground text-sm">
                  Generate intelligent quizzes with AI on any topic in seconds
                </p>
              </div>
            </div>
            <Link href="/create-quiz" className="w-full sm:w-auto">
              <motion.div 
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="w-full sm:min-w-32">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Quiz
                </Button>
              </motion.div>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            Create AI Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Generate intelligent quizzes on any topic using our advanced AI.
            Just provide a topic and let our AI create engaging questions for
            you.
          </p>
          <Link href="/create-quiz">
            <Button className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Create AI Quiz
            </Button>
          </Link>
        </CardContent>
      </Card> */}
    </motion.div>
  );
}
