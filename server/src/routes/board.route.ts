import express, { type Request, type Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";

export const boardRouter = express.Router();

interface CreateBoardBody {
  workspace_id: number;
  name: string;
  description: string;
  background: string;
}

boardRouter.post("/", authMiddleware, async (req: Request<{}, {}, CreateBoardBody>, res: Response) => {
  const { workspace_id, name, description, background } = req.body;
  const createdBy = req.userId!;

  if (!workspace_id || !name || !description || !background) {
    res.status(400).json({ error: "workspace_id, name, description and background are required" });
    return;
  }

  const workspaceMembership = await prisma.workspaceMember.findUnique({
    where: { workspace_id_user_id: { workspace_id, user_id: createdBy } },
  });

  if (!workspaceMembership) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  const board = await prisma.$transaction(async (tx) => {
    const created = await tx.board.create({
      data: { workspace_id, name, description, background, created_by: createdBy },
    });

    await tx.boardMember.create({
      data: { board_id: created.id, user_id: createdBy, role: "Owner" },
    });

    return created;
  });

  res.status(201).json(board);
});

boardRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  const workspaceId = req.query["workspace_id"] ? Number(req.query["workspace_id"]) : undefined;

  const memberships = await prisma.boardMember.findMany({
    where: {
      user_id: req.userId!,
      ...(workspaceId && { board: { workspace_id: workspaceId } }),
    },
    select: {
      role: true,
      // Counting through the relation avoids loading any card rows.
      board: { include: { lists: { select: { _count: { select: { cards: true } } } } } },
    },
  });

  const boards = memberships.map(({ board, role }) => {
    const { lists, ...rest } = board;

    return {
      ...rest,
      role,
      list_count: lists.length,
      card_count: lists.reduce((total, list) => total + list._count.cards, 0),
    };
  });

  res.json(boards);
});

boardRouter.get("/:boardId", authMiddleware, async (req: Request<{ boardId: string }>, res: Response) => {
  const boardId = Number(req.params.boardId);

  if (!Number.isInteger(boardId)) {
    res.status(400).json({ error: "boardId must be a number" });
    return;
  }

  const membership = await prisma.boardMember.findUnique({
    where: { board_id_user_id: { board_id: boardId, user_id: req.userId! } },
    select: {
      role: true,
      // Lists and cards ship with the board so opening it is a single request
      // rather than one request per list.
      board: {
        include: {
          lists: {
            orderBy: { position: "asc" },
            include: { cards: { orderBy: { position: "asc" } } },
          },
        },
      },
    },
  });

  if (!membership) {
    res.status(404).json({ error: "Board not found" });
    return;
  }

  res.json({ ...membership.board, role: membership.role });
});

interface UpdateBoardBody {
  name?: string;
  description?: string;
  background?: string;
}

boardRouter.patch(
  "/:boardId",
  authMiddleware,
  async (req: Request<{ boardId: string }, {}, UpdateBoardBody>, res: Response) => {
    const boardId = Number(req.params.boardId);
    const { name, description, background } = req.body;

    if (!name && !description && !background) {
      res.status(400).json({ error: "name, description or background is required" });
      return;
    }

    const membership = await prisma.boardMember.findUnique({
      where: { board_id_user_id: { board_id: boardId, user_id: req.userId! } },
    });

    if (!membership) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    if (membership.role === "Member") {
      res.status(403).json({ error: "You do not have permission to update this board" });
      return;
    }

    const board = await prisma.board.update({
      where: { id: boardId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(background && { background }),
      },
    });

    res.json(board);
  },
);

boardRouter.delete("/:boardId", authMiddleware, async (req: Request<{ boardId: string }>, res: Response) => {
  const boardId = Number(req.params.boardId);

  const membership = await prisma.boardMember.findUnique({
    where: { board_id_user_id: { board_id: boardId, user_id: req.userId! } },
  });

  if (!membership) {
    res.status(404).json({ error: "Board not found" });
    return;
  }

  if (membership.role !== "Owner") {
    res.status(403).json({ error: "Only the board owner can delete this board" });
    return;
  }

  await prisma.board.delete({ where: { id: boardId } });

  res.status(204).send();
});

interface AddBoardMemberBody {
  email: string;
  role?: "Admin" | "Member";
}

boardRouter.post(
  "/:boardId/members",
  authMiddleware,
  async (req: Request<{ boardId: string }, {}, AddBoardMemberBody>, res: Response) => {
    const boardId = Number(req.params.boardId);
    const { email, role } = req.body;

    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    if (role && role !== "Admin" && role !== "Member") {
      res.status(400).json({ error: "role must be Admin or Member" });
      return;
    }

    const requesterMembership = await prisma.boardMember.findUnique({
      where: { board_id_user_id: { board_id: boardId, user_id: req.userId! } },
    });

    if (!requesterMembership) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    if (requesterMembership.role === "Member") {
      res.status(403).json({ error: "You do not have permission to add members to this board" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "No user found with this email" });
      return;
    }

    const existingMembership = await prisma.boardMember.findUnique({
      where: { board_id_user_id: { board_id: boardId, user_id: user.id } },
    });

    if (existingMembership) {
      res.status(409).json({ error: "This user is already a member of the board" });
      return;
    }

    const member = await prisma.boardMember.create({
      data: { board_id: boardId, user_id: user.id, role: role ?? "Member" },
      select: { role: true, user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ ...member.user, role: member.role });
  },
);

boardRouter.get(
  "/:boardId/members",
  authMiddleware,
  async (req: Request<{ boardId: string }>, res: Response) => {
    const boardId = Number(req.params.boardId);

    const requesterMembership = await prisma.boardMember.findUnique({
      where: { board_id_user_id: { board_id: boardId, user_id: req.userId! } },
    });

    if (!requesterMembership) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    const members = await prisma.boardMember.findMany({
      where: { board_id: boardId },
      select: { role: true, user: { select: { id: true, name: true, email: true } } },
    });

    res.json(members.map(({ user, role }) => ({ ...user, role })));
  },
);

boardRouter.delete(
  "/:boardId/members/:userId",
  authMiddleware,
  async (req: Request<{ boardId: string; userId: string }>, res: Response) => {
    const boardId = Number(req.params.boardId);
    const targetUserId = Number(req.params.userId);

    const requesterMembership = await prisma.boardMember.findUnique({
      where: { board_id_user_id: { board_id: boardId, user_id: req.userId! } },
    });

    if (!requesterMembership) {
      res.status(404).json({ error: "Board not found" });
      return;
    }

    if (requesterMembership.role === "Member") {
      res.status(403).json({ error: "You do not have permission to remove members from this board" });
      return;
    }

    const targetMembership = await prisma.boardMember.findUnique({
      where: { board_id_user_id: { board_id: boardId, user_id: targetUserId } },
    });

    if (!targetMembership) {
      res.status(404).json({ error: "Member not found on this board" });
      return;
    }

    if (targetMembership.role === "Owner") {
      res.status(403).json({ error: "The board owner cannot be removed" });
      return;
    }

    await prisma.boardMember.delete({
      where: { board_id_user_id: { board_id: boardId, user_id: targetUserId } },
    });

    res.status(204).send();
  },
);
