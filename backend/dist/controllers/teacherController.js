"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResource = exports.updateResource = exports.createResource = exports.listResources = exports.getTeacherAnalytics = exports.publishResults = exports.deleteMockTest = exports.updateMockTest = exports.createMockTest = exports.listMockTests = exports.assignCourseAccess = exports.listStudentsForTeacher = exports.getTeacherDashboard = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
function parseIntParam(value) {
    const n = typeof value === "string" ? Number.parseInt(value, 10) : typeof value === "number" ? value : NaN;
    return Number.isFinite(n) ? n : null;
}
const assignSchema = zod_1.z.object({
    courseId: zod_1.z.coerce.number().int().positive(),
    studentIds: zod_1.z.array(zod_1.z.coerce.number().int().positive()).optional(),
    batches: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
});
const getTeacherDashboard = async (req, res) => {
    const userId = req.authUser.id;
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true } });
    const courses = await prisma_1.prisma.adminCourse.findMany({ orderBy: { title: "asc" } });
    const batches = await prisma_1.prisma.adminStudent.findMany({ distinct: ["batch"], select: { batch: true }, orderBy: { batch: "asc" } });
    res.json({ success: true, teacher: user, courses, batches: batches.map((b) => b.batch) });
};
exports.getTeacherDashboard = getTeacherDashboard;
const listStudentsForTeacher = async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
    const batch = typeof req.query.batch === "string" ? req.query.batch.trim() : "";
    const courseId = parseIntParam(req.query.courseId);
    const students = await prisma_1.prisma.adminStudent.findMany({
        where: {
            ...(q
                ? {
                    OR: [
                        { name: { contains: q } },
                        { email: { contains: q } },
                        { phone: { contains: q } },
                    ],
                }
                : {}),
            ...(batch ? { batch } : {}),
            ...(courseId ? { courseId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 200,
    });
    res.json({ success: true, students });
};
exports.listStudentsForTeacher = listStudentsForTeacher;
const assignCourseAccess = async (req, res) => {
    const actorId = req.authUser.id;
    const payload = assignSchema.parse(req.body);
    const course = await prisma_1.prisma.adminCourse.findUnique({ where: { id: payload.courseId } });
    if (!course)
        return res.status(404).json({ success: false, message: "Course not found." });
    const fromStudentIds = payload.studentIds ?? [];
    let students = [];
    if (payload.batches?.length) {
        const batchStudents = await prisma_1.prisma.adminStudent.findMany({
            where: { batch: { in: payload.batches } },
            select: { id: true, batch: true, course: true, courseId: true },
        });
        students = students.concat(batchStudents);
    }
    if (fromStudentIds.length) {
        const idStudents = await prisma_1.prisma.adminStudent.findMany({
            where: { id: { in: fromStudentIds } },
            select: { id: true, batch: true, course: true, courseId: true },
        });
        students = students.concat(idStudents);
    }
    const uniqueIds = Array.from(new Set(students.map((s) => s.id)));
    if (uniqueIds.length === 0)
        return res.status(400).json({ success: false, message: "Select at least one student or batch." });
    const created = await prisma_1.prisma.$transaction(async (tx) => {
        let count = 0;
        for (const studentId of uniqueIds) {
            await tx.studentCourseAccess.upsert({
                where: { studentId_courseId: { studentId, courseId: course.id } },
                update: { assignedByUserId: actorId },
                create: { studentId, courseId: course.id, assignedByUserId: actorId },
            });
            // Keep legacy admin panels in sync (main course fields).
            await tx.adminStudent.update({
                where: { id: studentId },
                data: { courseId: course.id, course: course.title },
            });
            count++;
        }
        return count;
    });
    res.json({ success: true, assigned: created });
};
exports.assignCourseAccess = assignCourseAccess;
const createMockTestSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2),
    scheduledAt: zod_1.z.string().trim().min(1),
    durationMinutes: zod_1.z.coerce.number().int().positive().max(600),
    questionCount: zod_1.z.coerce.number().int().positive().max(200),
    courseId: zod_1.z.coerce.number().int().positive().optional().nullable(),
    batch: zod_1.z.string().trim().optional().nullable(),
});
const listMockTests = async (req, res) => {
    const userId = req.authUser.id;
    const tests = await prisma_1.prisma.mockTest.findMany({
        where: { createdByUserId: userId },
        orderBy: { scheduledAt: "desc" },
        include: { course: true, _count: { select: { attempts: true } } },
    });
    res.json({
        success: true,
        tests: tests.map((t) => ({
            id: t.id,
            title: t.title,
            scheduledAt: t.scheduledAt,
            durationMinutes: t.durationMinutes,
            questionCount: t.questionCount,
            isPublished: t.isPublished,
            courseId: t.courseId,
            courseTitle: t.course?.title ?? null,
            batch: t.batch,
            attempts: t._count.attempts,
        })),
    });
};
exports.listMockTests = listMockTests;
function buildPlaceholderQuestions(count) {
    const questions = [];
    for (let i = 0; i < count; i++) {
        const opts = [`Option A`, `Option B`, `Option C`, `Option D`];
        questions.push({
            order: i + 1,
            question: `Question ${i + 1}`,
            optionsJson: JSON.stringify(opts),
            correctIndex: 0,
        });
    }
    return questions;
}
const createMockTest = async (req, res) => {
    const userId = req.authUser.id;
    const payload = createMockTestSchema.parse(req.body);
    const scheduledAt = new Date(payload.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime()))
        return res.status(400).json({ success: false, message: "Invalid scheduled date." });
    const created = await prisma_1.prisma.$transaction(async (tx) => {
        const test = await tx.mockTest.create({
            data: {
                title: payload.title,
                scheduledAt,
                durationMinutes: payload.durationMinutes,
                questionCount: payload.questionCount,
                courseId: payload.courseId ?? null,
                batch: payload.batch ?? null,
                createdByUserId: userId,
            },
        });
        const questions = buildPlaceholderQuestions(payload.questionCount).map((q) => ({ ...q, mockTestId: test.id }));
        for (const q of questions) {
            await tx.mockQuestion.create({ data: q });
        }
        return test;
    });
    res.status(201).json({ success: true, test: created });
};
exports.createMockTest = createMockTest;
const updateMockTestSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2).optional(),
    scheduledAt: zod_1.z.string().trim().min(1).optional(),
    durationMinutes: zod_1.z.coerce.number().int().positive().max(600).optional(),
    questionCount: zod_1.z.coerce.number().int().positive().max(200).optional(),
    courseId: zod_1.z.coerce.number().int().positive().optional().nullable(),
    batch: zod_1.z.string().trim().optional().nullable(),
    isPublished: zod_1.z.boolean().optional(),
});
const updateMockTest = async (req, res) => {
    const userId = req.authUser.id;
    const testId = req.params.id;
    const payload = updateMockTestSchema.parse(req.body);
    const existing = await prisma_1.prisma.mockTest.findFirst({ where: { id: testId, createdByUserId: userId } });
    if (!existing)
        return res.status(404).json({ success: false, message: "Mock test not found." });
    const scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : undefined;
    if (scheduledAt && Number.isNaN(scheduledAt.getTime()))
        return res.status(400).json({ success: false, message: "Invalid scheduled date." });
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        const test = await tx.mockTest.update({
            where: { id: existing.id },
            data: {
                title: payload.title ?? undefined,
                scheduledAt: scheduledAt ?? undefined,
                durationMinutes: payload.durationMinutes ?? undefined,
                questionCount: payload.questionCount ?? undefined,
                courseId: payload.courseId === undefined ? undefined : payload.courseId,
                batch: payload.batch === undefined ? undefined : payload.batch,
                isPublished: payload.isPublished ?? undefined,
            },
        });
        if (payload.questionCount && payload.questionCount !== existing.questionCount) {
            const current = await tx.mockQuestion.count({ where: { mockTestId: existing.id } });
            if (payload.questionCount > current) {
                const addCount = payload.questionCount - current;
                const start = current + 1;
                const add = buildPlaceholderQuestions(addCount).map((q, i) => ({
                    mockTestId: existing.id,
                    order: start + i,
                    question: q.question.replace(/^Question\s+\d+$/, `Question ${start + i}`),
                    optionsJson: q.optionsJson,
                    correctIndex: q.correctIndex,
                }));
                for (const q of add) {
                    await tx.mockQuestion.create({ data: q });
                }
            }
            else {
                await tx.mockQuestion.deleteMany({ where: { mockTestId: existing.id, order: { gt: payload.questionCount } } });
            }
        }
        return test;
    });
    res.json({ success: true, test: updated });
};
exports.updateMockTest = updateMockTest;
const deleteMockTest = async (req, res) => {
    const userId = req.authUser.id;
    const testId = req.params.id;
    const existing = await prisma_1.prisma.mockTest.findFirst({ where: { id: testId, createdByUserId: userId } });
    if (!existing)
        return res.status(404).json({ success: false, message: "Mock test not found." });
    await prisma_1.prisma.mockTest.delete({ where: { id: existing.id } });
    res.json({ success: true });
};
exports.deleteMockTest = deleteMockTest;
const publishResults = async (req, res) => {
    const userId = req.authUser.id;
    const tests = await prisma_1.prisma.mockTest.findMany({ where: { createdByUserId: userId } });
    const testIds = tests.map((t) => t.id);
    if (testIds.length === 0)
        return res.json({ success: true, publishedTests: 0, publishedAttempts: 0 });
    const now = new Date();
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const publishedTests = await tx.mockTest.updateMany({
            where: { id: { in: testIds } },
            data: { isPublished: true },
        });
        const publishedAttempts = await tx.mockTestAttempt.updateMany({
            where: { mockTestId: { in: testIds }, publishedAt: null },
            data: { publishedAt: now },
        });
        return { publishedTests: publishedTests.count, publishedAttempts: publishedAttempts.count };
    });
    res.json({ success: true, ...result });
};
exports.publishResults = publishResults;
const getTeacherAnalytics = async (req, res) => {
    const userId = req.authUser.id;
    const attempts = await prisma_1.prisma.mockTestAttempt.findMany({
        where: { mockTest: { createdByUserId: userId, isPublished: true } },
        include: { student: true, mockTest: true },
    });
    const byStudent = new Map();
    for (const a of attempts) {
        const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
        const cur = byStudent.get(a.studentId) ?? { student: { id: a.studentId, name: a.student.name }, scores: [] };
        cur.scores.push(pct);
        byStudent.set(a.studentId, cur);
    }
    const leaderboard = Array.from(byStudent.values()).map((row) => {
        const avg = row.scores.length ? Math.round(row.scores.reduce((s, v) => s + v, 0) / row.scores.length) : 0;
        const status = avg >= 90 ? "Top Performer" : avg >= 80 ? "Excellent" : avg >= 70 ? "Good" : "Improving";
        return { studentId: row.student.id, name: row.student.name, avgPct: `${avg}%`, testsTaken: row.scores.length, status };
    });
    leaderboard.sort((a, b) => Number.parseInt(b.avgPct, 10) - Number.parseInt(a.avgPct, 10));
    res.json({ success: true, leaderboard });
};
exports.getTeacherAnalytics = getTeacherAnalytics;
const resourceSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2),
    description: zod_1.z.string().trim().min(5),
    url: zod_1.z.string().trim().min(1),
    courseId: zod_1.z.coerce.number().int().positive().optional().nullable(),
    batch: zod_1.z.string().trim().optional().nullable(),
    isPublished: zod_1.z.boolean().optional(),
});
const listResources = async (req, res) => {
    const userId = req.authUser.id;
    const resources = await prisma_1.prisma.teacherResource.findMany({
        where: { createdByUserId: userId },
        orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, resources });
};
exports.listResources = listResources;
const createResource = async (req, res) => {
    const userId = req.authUser.id;
    const payload = resourceSchema.parse(req.body);
    const created = await prisma_1.prisma.teacherResource.create({
        data: {
            title: payload.title,
            description: payload.description,
            url: payload.url,
            courseId: payload.courseId ?? null,
            batch: payload.batch ?? null,
            isPublished: payload.isPublished ?? true,
            createdByUserId: userId,
        },
    });
    res.status(201).json({ success: true, resource: created });
};
exports.createResource = createResource;
const updateResource = async (req, res) => {
    const userId = req.authUser.id;
    const resourceId = req.params.id;
    const payload = resourceSchema.partial().parse(req.body);
    const existing = await prisma_1.prisma.teacherResource.findFirst({ where: { id: resourceId, createdByUserId: userId } });
    if (!existing)
        return res.status(404).json({ success: false, message: "Resource not found." });
    const updated = await prisma_1.prisma.teacherResource.update({
        where: { id: existing.id },
        data: {
            title: payload.title ?? undefined,
            description: payload.description ?? undefined,
            url: payload.url ?? undefined,
            courseId: payload.courseId === undefined ? undefined : payload.courseId,
            batch: payload.batch === undefined ? undefined : payload.batch,
            isPublished: payload.isPublished ?? undefined,
        },
    });
    res.json({ success: true, resource: updated });
};
exports.updateResource = updateResource;
const deleteResource = async (req, res) => {
    const userId = req.authUser.id;
    const resourceId = req.params.id;
    const existing = await prisma_1.prisma.teacherResource.findFirst({ where: { id: resourceId, createdByUserId: userId } });
    if (!existing)
        return res.status(404).json({ success: false, message: "Resource not found." });
    await prisma_1.prisma.teacherResource.delete({ where: { id: existing.id } });
    res.json({ success: true });
};
exports.deleteResource = deleteResource;
