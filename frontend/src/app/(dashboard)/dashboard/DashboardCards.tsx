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
      <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
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
              <Button variant="outline" className="w-full">
                View Public Quizzes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
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
              <Button variant="outline" className="w-full">
                View My Quizzes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5" />
              Create Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Generate intelligent quizzes with AI on any topic in seconds.
            </p>
            <Link href="/create-quiz">
              <Button variant="default" className="w-full">
                Create Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={cardVariants}
        whileHover={{ scale: 1.02 }}
        className="col-span-full"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-primary h-5 w-5" />
              Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Track your quiz performance, learning progress, and detailed
              insights across all your activities.
            </p>
            <Link href="/analytics">
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
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
