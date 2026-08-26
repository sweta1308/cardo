import express, { type Request, type Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";

export const workspaceRouter = express.Router();

interface CreateWorkspaceBody {
  name: string;
  description: string;
}

workspaceRouter.post("/", authMiddleware, async (req: Request<{}, {}, CreateWorkspaceBody>, res: Response) => {
  const { name, description } = req.body;
  const ownerId = req.userId!;

  if (!name || !description) {
    res.status(400).json({ error: "name and description are required" });
    return;
  }

  const workspace = await prisma.$transaction(async (tx) => {
    const created = await tx.workspace.create({
      data: { name, description, owner_id: ownerId },
    });

    await tx.workspaceMember.create({
      data: { workspace_id: created.id, user_id: ownerId, role: "Owner" },
    });

    return created;
  });

  res.status(201).json(workspace);
});

workspaceRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { user_id: req.userId! },
    select: { role: true, workspace: true },
  });

  const workspaces = memberships.map(({ workspace, role }) => ({ ...workspace, role }));

  res.json(workspaces);
});

workspaceRouter.get(
  "/:workspaceId",
  authMiddleware,
  async (req: Request<{ workspaceId: string }>, res: Response) => {
    const workspaceId = Number(req.params.workspaceId);

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: req.userId! } },
      select: { role: true, workspace: true },
    });

    if (!membership) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    res.json({ ...membership.workspace, role: membership.role });
  },
);

interface UpdateWorkspaceBody {
  name?: string;
  description?: string;
}

workspaceRouter.patch(
  "/:workspaceId",
  authMiddleware,
  async (req: Request<{ workspaceId: string }, {}, UpdateWorkspaceBody>, res: Response) => {
    const workspaceId = Number(req.params.workspaceId);
    const { name, description } = req.body;

    if (!name && !description) {
      res.status(400).json({ error: "name or description is required" });
      return;
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: req.userId! } },
    });

    if (!membership) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    if (membership.role === "Member") {
      res.status(403).json({ error: "You do not have permission to update this workspace" });
      return;
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { ...(name && { name }), ...(description && { description }) },
    });

    res.json(workspace);
  },
);

workspaceRouter.delete(
  "/:workspaceId",
  authMiddleware,
  async (req: Request<{ workspaceId: string }>, res: Response) => {
    const workspaceId = Number(req.params.workspaceId);

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: req.userId! } },
    });

    if (!membership) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    if (membership.role !== "Owner") {
      res.status(403).json({ error: "Only the workspace owner can delete this workspace" });
      return;
    }

    await prisma.workspace.delete({ where: { id: workspaceId } });

    res.status(204).send();
  },
);