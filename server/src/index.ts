import "dotenv/config";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.route.js";
import { workspaceRouter } from "./routes/workspace.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRouter);

app.use("/api/workspaces", workspaceRouter);

const PORT = process.env["PORT"] ? Number(process.env["PORT"]) : 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});