import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./env";
import { errorHandler } from "./middleware/error-handler";
import { sanitizeInput } from "./middleware/sanitization";
import { generalApiLimiter } from "./lib/ratelimits";
import { cleanupAllExpiredSessions } from "./services/sessionService";
import metaRouter from "./routes/meta";
import usersRouter from "./routes/users";
import onboardingRouter from "./routes/onboarding";
import authRouter from "./routes/auth";
import quizzesRouter from "./routes/quizzes";
import manualQuizzesRouter from "./routes/manual-quizzes";
import analyticsRouter from "./routes/analytics";

const app = express();
const port = env.PORT || 8080;

app.use(helmet());

app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:4000"],
    credentials: true,
  })
);

app.use(generalApiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api/meta", metaRouter);
app.use("/api/users", usersRouter);
app.use("/api/onboarding", onboardingRouter);
app.use("/api/auth", authRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/manual-quizzes", manualQuizzesRouter);
app.use("/api/analytics", analyticsRouter);

app.use(errorHandler);

const server = app.listen(port, () =>
  console.log(`Backend started on port ${port}`)
);

// ! Clean up expired sessions every hour to keep the database clean
const sessionCleanupInterval = setInterval(
  async () => {
    try {
      await cleanupAllExpiredSessions();
      console.log("Expired sessions cleaned up");
    } catch (error) {
      console.error("Failed to cleanup expired sessions:", error);
    }
  },
  60 * 60 * 1000
);

const gracefulShutdown = (signal: string) => {
  console.log(`Shutting down the server...`);

  // Clear the session cleanup interval
  clearInterval(sessionCleanupInterval);

  server.close((err) => {
    if (err) {
      console.error("Error during server shutdown:", err);
      process.exit(1);
    }

    console.log("Server closed successfully.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Force shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
