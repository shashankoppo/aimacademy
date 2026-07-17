import { Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthUser } from "../middleware/auth";

const handleError = (res: Response, error: unknown, fallbackMessage: string) => {
  console.error(fallbackMessage, error);
  const message = error instanceof Error ? error.message : fallbackMessage;
  if (!res.headersSent) res.status(500).json({ success: false, message });
};

// --- ADMIN ENDPOINTS ---

export const getMockTests = async (_req: Request, res: Response) => {
  try {
    const tests = await prisma.mockTest.findMany({
      include: {
        questions: { orderBy: { order: "asc" } },
        _count: { select: { attempts: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, tests });
  } catch (error) {
    handleError(res, error, "Failed to get mock tests");
  }
};

export const createMockTest = async (req: Request, res: Response) => {
  try {
    const { title, durationMinutes, courseId, questions, isPublished, scheduledAt } = req.body;
    const authUser = (req as any).authUser as AuthUser;

    const test = await prisma.mockTest.create({
      data: {
        title,
        durationMinutes: durationMinutes || 30,
        questionCount: Array.isArray(questions) ? questions.length : 0,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        courseId: courseId || null,
        isPublished: isPublished ?? false,
        createdByUserId: authUser.id,
        questions: {
          create: (questions || []).map((q: any, i: number) => ({
            question: q.question,
            optionsJson: JSON.stringify(q.options),
            correctIndex: q.correct,
            order: i,
          })),
        },
      },
      include: {
        questions: { orderBy: { order: "asc" } },
        _count: { select: { attempts: true } },
      },
    });

    res.status(201).json({ success: true, test });
  } catch (error) {
    handleError(res, error, "Failed to create mock test");
  }
};

export const updateMockTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, durationMinutes, isPublished, questions, scheduledAt, courseId } = req.body;

    // Delete existing questions and re-create
    await prisma.mockQuestion.deleteMany({ where: { mockTestId: id } });

    const test = await prisma.mockTest.update({
      where: { id },
      data: {
        title,
        durationMinutes: durationMinutes || 30,
        questionCount: Array.isArray(questions) ? questions.length : 0,
        isPublished: isPublished ?? false,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        courseId: courseId !== undefined ? (courseId || null) : undefined,
        questions: {
          create: (questions || []).map((q: any, i: number) => ({
            question: q.question,
            optionsJson: JSON.stringify(q.options),
            correctIndex: q.correct,
            order: i,
          })),
        },
      },
      include: {
        questions: { orderBy: { order: "asc" } },
        _count: { select: { attempts: true } },
      },
    });

    res.json({ success: true, test });
  } catch (error) {
    handleError(res, error, "Failed to update mock test");
  }
};

export const deleteMockTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.mockTest.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Failed to delete mock test");
  }
};
