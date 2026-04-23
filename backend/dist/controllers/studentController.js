"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStudentResources = exports.listStudentResults = exports.submitStudentMockTest = exports.getStudentMockTestById = exports.getStudentMockTestCurrent = exports.getStudentDashboard = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
function normalizePhoneDigits(value) {
    return value.replace(/\D/g, "");
}
async function findStudentRecordForUser(userId) {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        return null;
    if (user.email) {
        const byEmail = await prisma_1.prisma.adminStudent.findUnique({ where: { email: user.email.toLowerCase() } });
        if (byEmail)
            return { user, student: byEmail };
    }
    if (user.phone) {
        const digits = normalizePhoneDigits(user.phone);
        if (digits) {
            const all = await prisma_1.prisma.adminStudent.findMany({ select: { id: true, name: true, email: true, phone: true, course: true, batch: true, attendance: true, feeStatus: true, totalFee: true, paidFee: true, nextDueDate: true, courseId: true } });
            const match = all.find((s) => normalizePhoneDigits(s.phone) === digits);
            if (match)
                return { user, student: match };
        }
    }
    return { user, student: null };
}
const getStudentDashboard = async (req, res) => {
    const userId = req.authUser.id;
    const found = await findStudentRecordForUser(userId);
    if (!found?.user)
        return res.status(401).json({ success: false, message: "Unauthorized." });
    if (!found.student) {
        return res.status(404).json({ success: false, message: "No student profile is linked to this account." });
    }
    const student = found.student;
    const accesses = await prisma_1.prisma.studentCourseAccess.findMany({
        where: { studentId: student.id },
        include: { course: true },
        orderBy: { createdAt: "desc" },
    });
    const assignedCourses = accesses.length
        ? accesses.map((a) => a.course)
        : student.courseId
            ? await prisma_1.prisma.adminCourse.findMany({ where: { id: student.courseId } })
            : await prisma_1.prisma.adminCourse.findMany({ where: { title: student.course } });
    const courseIds = assignedCourses.map((c) => c.id);
    const publishedTests = await prisma_1.prisma.mockTest.findMany({
        where: {
            isPublished: true,
            ...(courseIds.length ? { OR: [{ courseId: { in: courseIds } }, { courseId: null }] } : {}),
            ...(student.batch ? { OR: [{ batch: null }, { batch: student.batch }] } : {}),
        },
        orderBy: { scheduledAt: "asc" },
        take: 25,
    });
    const attempts = await prisma_1.prisma.mockTestAttempt.findMany({
        where: { studentId: student.id },
        select: { mockTestId: true, score: true, total: true, submittedAt: true, publishedAt: true },
    });
    const attemptByTest = new Map(attempts.map((a) => [a.mockTestId, a]));
    const mockTests = publishedTests.slice(0, 3).map((t) => {
        const a = attemptByTest.get(t.id);
        const status = a ? "Completed" : t.scheduledAt.getTime() > Date.now() ? "Upcoming" : "Open";
        return {
            id: t.id,
            title: t.title,
            date: t.scheduledAt.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }),
            duration: `${t.durationMinutes} Min`,
            status,
        };
    });
    const courses = assignedCourses.map((c) => {
        const courseTests = publishedTests.filter((t) => t.courseId === c.id);
        const done = courseTests.filter((t) => attemptByTest.has(t.id)).length;
        const progress = courseTests.length ? Math.min(100, Math.round((done / courseTests.length) * 100)) : 0;
        return {
            id: c.id,
            title: c.title,
            progress,
            nextLesson: c.duration,
        };
    });
    const announcements = await prisma_1.prisma.announcement.findMany({
        where: { OR: [{ target: "All Users" }, { target: "Students Only" }] },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 5,
    });
    const alerts = announcements.map((a) => ({
        title: a.title,
        time: a.createdAt.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        type: a.type,
    }));
    res.json({
        success: true,
        student: {
            id: student.id,
            name: student.name,
            batch: student.batch,
            course: student.course,
            feeStatus: student.feeStatus,
            attendance: student.attendance,
            totalFee: student.totalFee,
            paidFee: student.paidFee,
            nextDueDate: student.nextDueDate,
        },
        courses,
        mockTests,
        alerts,
    });
};
exports.getStudentDashboard = getStudentDashboard;
const getStudentMockTestCurrent = async (req, res) => {
    const userId = req.authUser.id;
    const found = await findStudentRecordForUser(userId);
    if (!found?.user)
        return res.status(401).json({ success: false, message: "Unauthorized." });
    if (!found.student)
        return res.status(404).json({ success: false, message: "No student profile is linked to this account." });
    const student = found.student;
    const accesses = await prisma_1.prisma.studentCourseAccess.findMany({ where: { studentId: student.id }, select: { courseId: true } });
    const courseIds = accesses.map((a) => a.courseId);
    const attempts = await prisma_1.prisma.mockTestAttempt.findMany({ where: { studentId: student.id }, select: { mockTestId: true } });
    const attemptedIds = new Set(attempts.map((a) => a.mockTestId));
    const tests = await prisma_1.prisma.mockTest.findMany({
        where: {
            isPublished: true,
            ...(courseIds.length ? { OR: [{ courseId: { in: courseIds } }, { courseId: null }] } : {}),
            ...(student.batch ? { OR: [{ batch: null }, { batch: student.batch }] } : {}),
        },
        orderBy: { scheduledAt: "asc" },
        take: 50,
    });
    const now = Date.now();
    const next = tests.find((t) => !attemptedIds.has(t.id) && t.scheduledAt.getTime() <= now) ?? tests.find((t) => !attemptedIds.has(t.id));
    if (!next)
        return res.status(404).json({ success: false, message: "No mock tests available." });
    const questions = await prisma_1.prisma.mockQuestion.findMany({
        where: { mockTestId: next.id },
        orderBy: { order: "asc" },
    });
    res.json({
        success: true,
        test: {
            id: next.id,
            title: next.title,
            durationSeconds: next.durationMinutes * 60,
            questions: questions.map((q) => ({
                id: q.id,
                question: q.question,
                options: JSON.parse(q.optionsJson),
                correct: q.correctIndex,
            })),
        },
    });
};
exports.getStudentMockTestCurrent = getStudentMockTestCurrent;
const getStudentMockTestById = async (req, res) => {
    const userId = req.authUser.id;
    const testId = req.params.id;
    const found = await findStudentRecordForUser(userId);
    if (!found?.user)
        return res.status(401).json({ success: false, message: "Unauthorized." });
    if (!found.student)
        return res.status(404).json({ success: false, message: "No student profile is linked to this account." });
    const student = found.student;
    const accesses = await prisma_1.prisma.studentCourseAccess.findMany({ where: { studentId: student.id }, select: { courseId: true } });
    const courseIds = accesses.map((a) => a.courseId);
    const test = await prisma_1.prisma.mockTest.findFirst({
        where: {
            id: testId,
            isPublished: true,
            ...(courseIds.length ? { OR: [{ courseId: { in: courseIds } }, { courseId: null }] } : {}),
            ...(student.batch ? { OR: [{ batch: null }, { batch: student.batch }] } : {}),
        },
    });
    if (!test)
        return res.status(404).json({ success: false, message: "Mock test not found." });
    const questions = await prisma_1.prisma.mockQuestion.findMany({ where: { mockTestId: test.id }, orderBy: { order: "asc" } });
    res.json({
        success: true,
        test: {
            id: test.id,
            title: test.title,
            durationSeconds: test.durationMinutes * 60,
            questions: questions.map((q) => ({
                id: q.id,
                question: q.question,
                options: JSON.parse(q.optionsJson),
                correct: q.correctIndex,
            })),
        },
    });
};
exports.getStudentMockTestById = getStudentMockTestById;
const submitSchema = zod_1.z.object({
    answers: zod_1.z.record(zod_1.z.string(), zod_1.z.number().int().nonnegative()),
});
const submitStudentMockTest = async (req, res) => {
    const userId = req.authUser.id;
    const testId = req.params.id;
    const found = await findStudentRecordForUser(userId);
    if (!found?.user)
        return res.status(401).json({ success: false, message: "Unauthorized." });
    if (!found.student)
        return res.status(404).json({ success: false, message: "No student profile is linked to this account." });
    const student = found.student;
    const payload = submitSchema.parse(req.body);
    const test = await prisma_1.prisma.mockTest.findFirst({ where: { id: testId, isPublished: true }, include: { questions: { orderBy: { order: "asc" } } } });
    if (!test)
        return res.status(404).json({ success: false, message: "Mock test not found." });
    const existing = await prisma_1.prisma.mockTestAttempt.findUnique({ where: { mockTestId_studentId: { mockTestId: test.id, studentId: student.id } } });
    if (existing)
        return res.status(409).json({ success: false, message: "This test is already submitted." });
    let score = 0;
    for (const q of test.questions) {
        const selected = payload.answers[String(q.order - 1)];
        if (selected === q.correctIndex)
            score++;
    }
    const total = test.questions.length;
    const attempt = await prisma_1.prisma.mockTestAttempt.create({
        data: {
            mockTestId: test.id,
            studentId: student.id,
            answersJson: JSON.stringify(payload.answers),
            score,
            total,
            publishedAt: null,
        },
    });
    res.json({
        success: true,
        result: {
            id: attempt.id,
            score,
            total,
            pct: total ? Math.round((score / total) * 100) : 0,
        },
    });
};
exports.submitStudentMockTest = submitStudentMockTest;
const listStudentResults = async (req, res) => {
    const userId = req.authUser.id;
    const found = await findStudentRecordForUser(userId);
    if (!found?.user)
        return res.status(401).json({ success: false, message: "Unauthorized." });
    if (!found.student)
        return res.status(404).json({ success: false, message: "No student profile is linked to this account." });
    const student = found.student;
    const attempts = await prisma_1.prisma.mockTestAttempt.findMany({
        where: { studentId: student.id, publishedAt: { not: null }, mockTest: { isPublished: true } },
        include: { mockTest: true },
        orderBy: { submittedAt: "desc" },
        take: 50,
    });
    res.json({
        success: true,
        results: attempts.map((a) => ({
            id: a.id,
            testId: a.mockTestId,
            title: a.mockTest.title,
            score: a.score,
            total: a.total,
            pct: a.total ? Math.round((a.score / a.total) * 100) : 0,
            submittedAt: a.submittedAt,
        })),
    });
};
exports.listStudentResults = listStudentResults;
const listStudentResources = async (req, res) => {
    const userId = req.authUser.id;
    const found = await findStudentRecordForUser(userId);
    if (!found?.user)
        return res.status(401).json({ success: false, message: "Unauthorized." });
    if (!found.student)
        return res.status(404).json({ success: false, message: "No student profile is linked to this account." });
    const student = found.student;
    const accesses = await prisma_1.prisma.studentCourseAccess.findMany({ where: { studentId: student.id }, select: { courseId: true } });
    const courseIds = accesses.map((a) => a.courseId);
    const resources = await prisma_1.prisma.teacherResource.findMany({
        where: {
            isPublished: true,
            ...(courseIds.length ? { OR: [{ courseId: { in: courseIds } }, { courseId: null }] } : {}),
            ...(student.batch ? { OR: [{ batch: null }, { batch: student.batch }] } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 100,
    });
    res.json({ success: true, resources });
};
exports.listStudentResources = listStudentResources;
