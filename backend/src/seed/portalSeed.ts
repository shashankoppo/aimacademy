import { prisma } from "../prisma";

function buildPlaceholderQuestions(count: number) {
  const questions: Array<{ order: number; question: string; optionsJson: string; correctIndex: number }> = [];
  for (let i = 0; i < count; i++) {
    questions.push({
      order: i + 1,
      question: `Question ${i + 1}`,
      optionsJson: JSON.stringify(["Option A", "Option B", "Option C", "Option D"]),
      correctIndex: 0,
    });
  }
  return questions;
}

let seeded: Promise<void> | null = null;

export async function ensurePortalSeeded() {
  if (!seeded) {
    seeded = (async () => {
      const teacher = await prisma.user.findUnique({ where: { email: "teacher@aim.edu" } });
      if (!teacher) return;

      const course = await prisma.adminCourse.findFirst({ orderBy: { createdAt: "asc" } });
      const existingTests = await prisma.mockTest.count();
      if (existingTests === 0) {
        const now = Date.now();
        const tests = [
          { title: "Weekly Ethics Quiz #04", questionCount: 30, durationMinutes: 45, scheduledAt: new Date(now - 2 * 24 * 60 * 60 * 1000) },
          { title: "Modern History Full Mock", questionCount: 100, durationMinutes: 120, scheduledAt: new Date(now - 1 * 24 * 60 * 60 * 1000) },
          { title: "CSAT Sectional Test", questionCount: 50, durationMinutes: 60, scheduledAt: new Date(now + 2 * 24 * 60 * 60 * 1000) },
        ];

        for (const t of tests) {
          const created = await prisma.mockTest.create({
            data: {
              title: t.title,
              questionCount: t.questionCount,
              durationMinutes: t.durationMinutes,
              scheduledAt: t.scheduledAt,
              isPublished: true,
              courseId: course?.id ?? null,
              createdByUserId: teacher.id,
            },
          });
          const questions = buildPlaceholderQuestions(t.questionCount).map((q) => ({ ...q, mockTestId: created.id }));
          for (const q of questions) {
            await prisma.mockQuestion.create({ data: q });
          }
        }
      }

      const existingResources = await prisma.teacherResource.count();
      if (existingResources === 0) {
        const resources = [
          {
            title: "Prelims Strategy PDF",
            description: "Quick revision notes and strategy guide for upcoming prelims.",
            url: "/resources/prelims-strategy.pdf",
            isPublished: true,
            courseId: course?.id ?? null,
            createdByUserId: teacher.id,
          },
          {
            title: "Current Affairs Handout",
            description: "Monthly current affairs handout (PDF).",
            url: "/resources/current-affairs.pdf",
            isPublished: true,
            courseId: course?.id ?? null,
            createdByUserId: teacher.id,
          },
        ];
        for (const r of resources) {
          await prisma.teacherResource.create({ data: r });
        }
      }
    })();
  }

  await seeded;
}
