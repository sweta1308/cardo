import "dotenv/config";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.route.js";
import { workspaceRouter } from "./routes/workspace.route.js";
import { boardRouter } from "./routes/board.route.js";
import { listRouter } from "./routes/list.route.js";
import { cardRouter } from "./routes/card.route.js";

for (const key of ["DATABASE_URL", "JWT_SECRET"]) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();

const allowedOrigins = (process.env["CLIENT_ORIGIN"] ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api", authRouter);

app.use("/api/workspaces", workspaceRouter);

app.use("/api/boards", boardRouter);

app.use("/api/lists", listRouter);

app.use("/api/cards", cardRouter);

const PORT = process.env["PORT"] ? Number(process.env["PORT"]) : 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
});
