import express from "express";
import cors from "cors";
import { env } from "./env";
import { errorHandler } from "./middleware/error-handler";
import metaRouter from "./routes/meta";
import usersRouter from "./routes/users";

const app = express();
const port = env.PORT;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/meta", metaRouter);
app.use("/api/users", usersRouter);

// Global error handler
app.use(errorHandler);

app.listen(port, () => console.log(`Backend started on port ${port}`));
