import express, { type Request, type Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";

export const listRouter = express.Router();

async function requireBoardMembership(boardId: number, userId: number) {
  return prisma.boardMember.findUnique({
    where: { board_id_user_id: { board_id: boardId, user_id: userId } },
  });
}

interface CreateListBody {
  board_id: number;
  name: string;
  position: number;
}

listRouter.post("/", authMiddleware, async (req: Request<{}, {}, CreateListBody>, res: Response) => {
  const { board_id, name, position } = req.body;

  if (!board_id || !name || position === undefined) {
    res.status(400).json({ error: "board_id, name and position are required" });
    return;
  }

  const membership = await requireBoardMembership(board_id, req.userId!);
  if (!membership) {
    res.status(404).json({ error: "Board not found" });
    return;
  }

  const list = await prisma.list.create({ data: { board_id, name, position } });

  res.status(201).json(list);
});

listRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  const boardId = req.query["board_id"] ? Number(req.query["board_id"]) : undefined;

  if (!boardId) {
    res.status(400).json({ error: "board_id is required" });
    return;
  }

  const membership = await requireBoardMembership(boardId, req.userId!);
  if (!membership) {
    res.status(404).json({ error: "Board not found" });
    return;
  }

  const lists = await prisma.list.findMany({
    where: { board_id: boardId },
    orderBy: { position: "asc" },
  });

  res.json(lists);
});

listRouter.get("/:listId", authMiddleware, async (req: Request<{ listId: string }>, res: Response) => {
  const listId = Number(req.params.listId);

  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) {
    res.status(404).json({ error: "List not found" });
    return;
  }

  const membership = await requireBoardMembership(list.board_id, req.userId!);
  if (!membership) {
    res.status(404).json({ error: "List not found" });
    return;
  }

  res.json(list);
});

interface UpdateListBody {
  name?: string;
  position?: number;
}

listRouter.patch(
  "/:listId",
  authMiddleware,
  async (req: Request<{ listId: string }, {}, UpdateListBody>, res: Response) => {
    const listId = Number(req.params.listId);
    const { name, position } = req.body;

    if (!name && position === undefined) {
      res.status(400).json({ error: "name or position is required" });
      return;
    }

    const existing = await prisma.list.findUnique({ where: { id: listId } });
    if (!existing) {
      res.status(404).json({ error: "List not found" });
      return;
    }

    const membership = await requireBoardMembership(existing.board_id, req.userId!);
    if (!membership) {
      res.status(404).json({ error: "List not found" });
      return;
    }

    const list = await prisma.list.update({
      where: { id: listId },
      data: { ...(name && { name }), ...(position !== undefined && { position }) },
    });

    res.json(list);
  },
);

listRouter.delete("/:listId", authMiddleware, async (req: Request<{ listId: string }>, res: Response) => {
  const listId = Number(req.params.listId);

  const existing = await prisma.list.findUnique({ where: { id: listId } });
  if (!existing) {
    res.status(404).json({ error: "List not found" });
    return;
  }

  const membership = await requireBoardMembership(existing.board_id, req.userId!);
  if (!membership) {
    res.status(404).json({ error: "List not found" });
    return;
  }

  await prisma.list.delete({ where: { id: listId } });

  res.status(204).send();
});
