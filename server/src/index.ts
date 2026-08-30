import "dotenv/config";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.route.js";
import { workspaceRouter } from "./routes/workspace.route.js";
import { boardRouter } from "./routes/board.route.js";
import { listRouter } from "./routes/list.route.js";
import { cardRouter } from "./routes/card.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRouter);

app.use("/api/workspaces", workspaceRouter);

app.use("/api/boards", boardRouter);

app.use("/api/lists", listRouter);

app.use("/api/cards", cardRouter);

const PORT = process.env["PORT"] ? Number(process.env["PORT"]) : 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});