import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./env";
import { errorHandler } from "./middleware/error-handler";
import { sanitizeInput } from "./middleware/sanitization";
import metaRouter from "./routes/meta";
import usersRouter from "./routes/users";
import onboardingRouter from "./routes/onboarding";
import authRouter from "./routes/auth";
import quizzesRouter from "./routes/quizzes";

const app = express();
const port = env.PORT || 8080;

// Security middleware
app.use(helmet());

app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

// Health check endpoint
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

// Global error handler
app.use(errorHandler);

const server = app.listen(port, () =>
  console.log(`Backend started on port ${port}`)
);

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      console.error("Error during server shutdown:", err);
      process.exit(1);
    }

    console.log("Server closed successfully.");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Force shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
