"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensurePortalSeeded = ensurePortalSeeded;
const prisma_1 = require("../prisma");
function buildPlaceholderQuestions(count) {
    const questions = [];
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
let seeded = null;
async function ensurePortalSeeded() {
    if (!seeded) {
        seeded = (async () => {
            const teacher = await prisma_1.prisma.user.findUnique({ where: { email: "teacher@aim.edu" } });
            if (!teacher)
                return;
            const course = await prisma_1.prisma.adminCourse.findFirst({ orderBy: { createdAt: "asc" } });
            const existingTests = await prisma_1.prisma.mockTest.count();
            if (existingTests === 0) {
                const now = Date.now();
                const tests = [
                    { title: "Weekly Ethics Quiz #04", questionCount: 30, durationMinutes: 45, scheduledAt: new Date(now - 2 * 24 * 60 * 60 * 1000) },
                    { title: "Modern History Full Mock", questionCount: 100, durationMinutes: 120, scheduledAt: new Date(now - 1 * 24 * 60 * 60 * 1000) },
                    { title: "CSAT Sectional Test", questionCount: 50, durationMinutes: 60, scheduledAt: new Date(now + 2 * 24 * 60 * 60 * 1000) },
                ];
                for (const t of tests) {
                    const created = await prisma_1.prisma.mockTest.create({
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
                        await prisma_1.prisma.mockQuestion.create({ data: q });
                    }
                }
            }
            const existingResources = await prisma_1.prisma.teacherResource.count();
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
                    await prisma_1.prisma.teacherResource.create({ data: r });
                }
            }
        })();
    }
    await seeded;
}
