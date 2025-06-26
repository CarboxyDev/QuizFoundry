import express from "express";
import cors from "cors";
import { env } from "./env";

const app = express();
const port = env.PORT;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.get("/test", (req, res) => {
  res.json({
    message: "Hello from Express!",
    status: "success",
  });
});

app.listen(port, () => console.log(`Backend listening on port ${port}`));
