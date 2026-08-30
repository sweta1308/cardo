import express, { type Request, type Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";

export const cardRouter = express.Router();

async function requireBoardMembershipForList(listId: number, userId: number) {
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) return null;

  const membership = await prisma.boardMember.findUnique({
    where: { board_id_user_id: { board_id: list.board_id, user_id: userId } },
  });
  if (!membership) return null;

  return list;
}

interface CreateCardBody {
  list_id: number;
  title: string;
  description?: string;
  position: number;
  due_date?: string;
}

cardRouter.post("/", authMiddleware, async (req: Request<{}, {}, CreateCardBody>, res: Response) => {
  const { list_id, title, description, position, due_date } = req.body;
  const createdBy = req.userId!;

  if (!list_id || !title || position === undefined) {
    res.status(400).json({ error: "list_id, title and position are required" });
    return;
  }

  const list = await requireBoardMembershipForList(list_id, createdBy);
  if (!list) {
    res.status(404).json({ error: "List not found" });
    return;
  }

  const card = await prisma.card.create({
    data: {
      list_id,
      title,
      position,
      created_by: createdBy,
      ...(description && { description }),
      ...(due_date && { due_date: new Date(due_date) }),
    },
  });

  res.status(201).json(card);
});

cardRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  const listId = req.query["list_id"] ? Number(req.query["list_id"]) : undefined;

  if (!listId) {
    res.status(400).json({ error: "list_id is required" });
    return;
  }

  const list = await requireBoardMembershipForList(listId, req.userId!);
  if (!list) {
    res.status(404).json({ error: "List not found" });
    return;
  }

  const cards = await prisma.card.findMany({
    where: { list_id: listId },
    orderBy: { position: "asc" },
  });

  res.json(cards);
});

cardRouter.get("/:cardId", authMiddleware, async (req: Request<{ cardId: string }>, res: Response) => {
  const cardId = Number(req.params.cardId);

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  const list = await requireBoardMembershipForList(card.list_id, req.userId!);
  if (!list) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  res.json(card);
});

interface UpdateCardBody {
  title?: string;
  description?: string;
  position?: number;
  due_date?: string | null;
  list_id?: number;
}

cardRouter.patch(
  "/:cardId",
  authMiddleware,
  async (req: Request<{ cardId: string }, {}, UpdateCardBody>, res: Response) => {
    const cardId = Number(req.params.cardId);
    const { title, description, position, due_date, list_id } = req.body;

    if (
      title === undefined &&
      description === undefined &&
      position === undefined &&
      due_date === undefined &&
      list_id === undefined
    ) {
      res.status(400).json({ error: "at least one field is required" });
      return;
    }

    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    const currentList = await requireBoardMembershipForList(card.list_id, req.userId!);
    if (!currentList) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    if (list_id && list_id !== card.list_id) {
      const targetList = await requireBoardMembershipForList(list_id, req.userId!);
      if (!targetList) {
        res.status(404).json({ error: "Target list not found" });
        return;
      }
    }

    const updated = await prisma.card.update({
      where: { id: cardId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(position !== undefined && { position }),
        ...(due_date !== undefined && { due_date: due_date ? new Date(due_date) : null }),
        ...(list_id !== undefined && { list_id }),
      },
    });

    res.json(updated);
  },
);

cardRouter.delete("/:cardId", authMiddleware, async (req: Request<{ cardId: string }>, res: Response) => {
  const cardId = Number(req.params.cardId);

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  const list = await requireBoardMembershipForList(card.list_id, req.userId!);
  if (!list) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  await prisma.card.delete({ where: { id: cardId } });

  res.status(204).send();
});

interface AssignCardMemberBody {
  email: string;
}

cardRouter.post(
  "/:cardId/members",
  authMiddleware,
  async (req: Request<{ cardId: string }, {}, AssignCardMemberBody>, res: Response) => {
    const cardId = Number(req.params.cardId);
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    const list = await requireBoardMembershipForList(card.list_id, req.userId!);
    if (!list) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "No user found with this email" });
      return;
    }

    const assigneeBoardMembership = await prisma.boardMember.findUnique({
      where: { board_id_user_id: { board_id: list.board_id, user_id: user.id } },
    });

    if (!assigneeBoardMembership) {
      res.status(400).json({ error: "User must be a member of this board before being assigned to a card" });
      return;
    }

    const existingAssignment = await prisma.cardMember.findUnique({
      where: { card_id_user_id: { card_id: cardId, user_id: user.id } },
    });

    if (existingAssignment) {
      res.status(409).json({ error: "This user is already assigned to the card" });
      return;
    }

    await prisma.cardMember.create({ data: { card_id: cardId, user_id: user.id } });

    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  },
);

cardRouter.get(
  "/:cardId/members",
  authMiddleware,
  async (req: Request<{ cardId: string }>, res: Response) => {
    const cardId = Number(req.params.cardId);

    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    const list = await requireBoardMembershipForList(card.list_id, req.userId!);
    if (!list) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    const assignees = await prisma.cardMember.findMany({
      where: { card_id: cardId },
      select: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json(assignees.map(({ user }) => user));
  },
);

cardRouter.delete(
  "/:cardId/members/:userId",
  authMiddleware,
  async (req: Request<{ cardId: string; userId: string }>, res: Response) => {
    const cardId = Number(req.params.cardId);
    const targetUserId = Number(req.params.userId);

    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    const list = await requireBoardMembershipForList(card.list_id, req.userId!);
    if (!list) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    const assignment = await prisma.cardMember.findUnique({
      where: { card_id_user_id: { card_id: cardId, user_id: targetUserId } },
    });

    if (!assignment) {
      res.status(404).json({ error: "This user is not assigned to the card" });
      return;
    }

    await prisma.cardMember.delete({
      where: { card_id_user_id: { card_id: cardId, user_id: targetUserId } },
    });

    res.status(204).send();
  },
);
