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

interface AddWorkspaceMemberBody {
  email: string;
  role?: "Admin" | "Member";
}

workspaceRouter.post(
  "/:workspaceId/members",
  authMiddleware,
  async (req: Request<{ workspaceId: string }, {}, AddWorkspaceMemberBody>, res: Response) => {
    const workspaceId = Number(req.params.workspaceId);
    const { email, role } = req.body;

    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    if (role && role !== "Admin" && role !== "Member") {
      res.status(400).json({ error: "role must be Admin or Member" });
      return;
    }

    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: req.userId! } },
    });

    if (!requesterMembership) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    if (requesterMembership.role === "Member") {
      res.status(403).json({ error: "You do not have permission to add members to this workspace" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "No user found with this email" });
      return;
    }

    const existingMembership = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user.id } },
    });

    if (existingMembership) {
      res.status(409).json({ error: "This user is already a member of the workspace" });
      return;
    }

    const member = await prisma.workspaceMember.create({
      data: { workspace_id: workspaceId, user_id: user.id, role: role ?? "Member" },
      select: { role: true, user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ ...member.user, role: member.role });
  },
);

workspaceRouter.get(
  "/:workspaceId/members",
  authMiddleware,
  async (req: Request<{ workspaceId: string }>, res: Response) => {
    const workspaceId = Number(req.params.workspaceId);

    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: req.userId! } },
    });

    if (!requesterMembership) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspace_id: workspaceId },
      select: { role: true, user: { select: { id: true, name: true, email: true } } },
    });

    res.json(members.map(({ user, role }) => ({ ...user, role })));
  },
);

workspaceRouter.delete(
  "/:workspaceId/members/:userId",
  authMiddleware,
  async (req: Request<{ workspaceId: string; userId: string }>, res: Response) => {
    const workspaceId = Number(req.params.workspaceId);
    const targetUserId = Number(req.params.userId);

    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: req.userId! } },
    });

    if (!requesterMembership) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    if (requesterMembership.role === "Member") {
      res.status(403).json({ error: "You do not have permission to remove members from this workspace" });
      return;
    }

    const targetMembership = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: targetUserId } },
    });

    if (!targetMembership) {
      res.status(404).json({ error: "Member not found in this workspace" });
      return;
    }

    if (targetMembership.role === "Owner") {
      res.status(403).json({ error: "The workspace owner cannot be removed" });
      return;
    }

    await prisma.workspaceMember.delete({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: targetUserId } },
    });

    res.status(204).send();
  },
);