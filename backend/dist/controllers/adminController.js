"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminVideo = exports.updateAdminVideo = exports.addAdminVideo = exports.getAdminVideos = exports.deleteAdminNote = exports.updateAdminNote = exports.addAdminNote = exports.getAdminNotes = exports.updateWebsiteSettings = exports.getWebsiteSettings = exports.sendFeeReminders = exports.markAttendance = exports.processPayroll = exports.getAdminStaff = exports.deleteAnnouncement = exports.updateAnnouncement = exports.addAnnouncement = exports.getAnnouncements = exports.deleteAdminCourse = exports.updateAdminCourse = exports.addAdminCourse = exports.getAdminCourses = exports.deleteAdminStudent = exports.updateAdminStudent = exports.addAdminStudent = exports.getAdminStudents = exports.getPublicContent = exports.getAdminOverview = exports.seedAdminData = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
const feeStatusSchema = zod_1.z.enum(["Paid", "Part Paid", "Overdue"]);
const courseStatusSchema = zod_1.z.enum(["Active", "Upcoming", "Completed"]);
const payrollStatusSchema = zod_1.z.enum(["Paid", "Pending", "Processing"]);
const attendanceStatusSchema = zod_1.z.enum(["Present", "Late", "On Leave"]);
const studentSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2),
    email: zod_1.z.string().trim().email(),
    course: zod_1.z.string().trim().min(2),
    batch: zod_1.z.string().trim().min(2),
    joinDate: zod_1.z.string().trim().min(3),
    feeStatus: feeStatusSchema,
    attendance: zod_1.z.string().trim().regex(/^\d{1,3}%$/),
    phone: zod_1.z.string().trim().min(10),
    totalFee: zod_1.z.coerce.number().int().nonnegative().optional(),
    paidFee: zod_1.z.coerce.number().int().nonnegative().optional(),
    nextInstallmentLabel: zod_1.z.string().trim().min(2).optional(),
    nextInstallmentAmount: zod_1.z.coerce.number().int().nonnegative().optional(),
    nextDueDate: zod_1.z.string().trim().min(1).optional(),
});
const courseSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2),
    students: zod_1.z.coerce.number().int().nonnegative().optional(),
    faculty: zod_1.z.string().trim().min(2),
    status: courseStatusSchema.optional(),
    duration: zod_1.z.string().trim().min(2),
    fee: zod_1.z.string().trim().min(1),
});
const announcementSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2),
    target: zod_1.z.string().trim().min(2),
    content: zod_1.z.string().trim().min(5),
    isPinned: zod_1.z.boolean().optional(),
    type: zod_1.z.string().trim().min(2),
});
const staffSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2),
    role: zod_1.z.string().trim().min(2),
    salary: zod_1.z.coerce.number().int().positive(),
    payrollStatus: payrollStatusSchema.optional(),
    payrollDate: zod_1.z.string().trim().min(1),
    attendanceStatus: attendanceStatusSchema.optional(),
    clockIn: zod_1.z.string().trim().min(1).optional(),
    clockOut: zod_1.z.string().trim().min(1).optional(),
});
const websiteSettingsSchema = zod_1.z.object({
    bannerText: zod_1.z.string().trim().min(5),
    slides: zod_1.z.array(zod_1.z.string().trim().min(1)).min(1),
    faculty: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().trim().min(2),
        sub: zod_1.z.string().trim().min(2),
        img: zod_1.z.string().trim().min(1),
    })).min(1),
});
const noteSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2),
    description: zod_1.z.string().trim().min(5),
    category: zod_1.z.string().trim().min(2),
    thumbnailUrl: zod_1.z.string().trim().optional().nullable(),
    fileUrl: zod_1.z.string().trim().optional().nullable(),
    viewUrl: zod_1.z.string().trim().optional().nullable(),
    isVisible: zod_1.z.boolean().optional(),
    displayOrder: zod_1.z.coerce.number().int().nonnegative().optional(),
});
const videoSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2),
    description: zod_1.z.string().trim().min(5),
    youtubeUrl: zod_1.z.string().trim().url(),
    thumbnailUrl: zod_1.z.string().trim().optional().nullable(),
    isVisible: zod_1.z.boolean().optional(),
    isFeatured: zod_1.z.boolean().optional(),
    displayOrder: zod_1.z.coerce.number().int().nonnegative().optional(),
});
const handleError = (res, error, fallbackMessage) => {
    if (error instanceof zod_1.z.ZodError) {
        return res.status(400).json({ error: error.issues[0]?.message ?? fallbackMessage });
    }
    const message = error instanceof Error ? error.message : fallbackMessage;
    console.error(`[AdminController] ${fallbackMessage}:`, error);
    return res.status(500).json({ error: message });
};
const parseCurrency = (value) => Number(value.replace(/[^\d]/g, "")) || 0;
const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
const calculateFeeStatus = (paidFee, totalFee) => {
    if (paidFee >= totalFee)
        return "Paid";
    if (paidFee > 0)
        return "Part Paid";
    return "Overdue";
};
const getYouTubeThumbnail = (youtubeUrl) => {
    const match = youtubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
};
const syncCourseStudentCount = async (courseTitle) => {
    const count = await prisma_1.prisma.adminStudent.count({ where: { course: courseTitle } });
    await prisma_1.prisma.adminCourse.updateMany({
        where: { title: courseTitle },
        data: { students: count },
    });
};
// Global seeding lock to avoid "Database is locked" in SQLite
let seedResult = null;
const seedAdminData = async () => {
    if (seedResult)
        return seedResult;
    seedResult = (async () => {
        try {
            console.log("[Seed] Starting admin data synchronization...");
            const courseSeeds = [
                { title: "UPSC 2026-A", students: 3, faculty: "Dr. Sandeep Kumar", status: "Active", duration: "12-18 Months", fee: formatCurrency(120000) },
                { title: "SSC CGL Fast Track", students: 2, faculty: "Rahul Verma", status: "Active", duration: "6 Months", fee: formatCurrency(45000) },
                { title: "Banking IBPS", students: 1, faculty: "Suresh Pillai", status: "Upcoming", duration: "4-6 Months", fee: formatCurrency(40000) },
                { title: "MPPSC Evening", students: 2, faculty: "Meera Nair", status: "Active", duration: "6-12 Months", fee: formatCurrency(75000) },
            ];
            for (const data of courseSeeds) {
                await prisma_1.prisma.adminCourse.upsert({
                    where: { title: data.title },
                    update: {},
                    create: data,
                });
            }
            const courses = await prisma_1.prisma.adminCourse.findMany();
            const courseMap = new Map(courses.map((c) => [c.title, c.id]));
            const studentSeeds = [
                { name: "Aarav Mehta", email: "aarav@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Paid", attendance: "88%", phone: "+91 98765 43210", totalFee: 120000, paidFee: 120000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", courseId: courseMap.get("UPSC 2026-A") },
                { name: "Deepa Nair", email: "deepa@aim.edu", course: "SSC CGL Fast Track", batch: "Evening", joinDate: "Mar 2025", feeStatus: "Paid", attendance: "96%", phone: "+91 87654 32109", totalFee: 45000, paidFee: 45000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", courseId: courseMap.get("SSC CGL Fast Track") },
                { name: "Rahul Kumar", email: "rahul@aim.edu", course: "Banking IBPS", batch: "Morning", joinDate: "Jun 2025", feeStatus: "Overdue", attendance: "72%", phone: "+91 76543 21098", totalFee: 40000, paidFee: 10000, nextInstallmentLabel: "Installment 2", nextInstallmentAmount: 15000, nextDueDate: "2026-04-20", courseId: courseMap.get("Banking IBPS") },
                { name: "Priya Sharma", email: "priya@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Part Paid", attendance: "80%", phone: "+91 65432 10987", totalFee: 120000, paidFee: 70000, nextInstallmentLabel: "Installment 3", nextInstallmentAmount: 25000, nextDueDate: "2026-04-24", courseId: courseMap.get("UPSC 2026-A") },
                { name: "Vikram Singh", email: "vikram@aim.edu", course: "MPPSC Evening", batch: "Evening", joinDate: "Sep 2025", feeStatus: "Paid", attendance: "92%", phone: "+91 54321 09876", totalFee: 75000, paidFee: 75000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", courseId: courseMap.get("MPPSC Evening") },
                { name: "Ananya Joshi", email: "ananya@aim.edu", course: "SSC CGL Fast Track", batch: "Morning", joinDate: "Feb 2025", feeStatus: "Overdue", attendance: "60%", phone: "+91 43210 98765", totalFee: 45000, paidFee: 0, nextInstallmentLabel: "Installment 1", nextInstallmentAmount: 15000, nextDueDate: "2026-04-18", courseId: courseMap.get("SSC CGL Fast Track") },
                { name: "Kunal Thakur", email: "kunal@aim.edu", course: "MPPSC Evening", batch: "Weekend", joinDate: "Nov 2025", feeStatus: "Paid", attendance: "85%", phone: "+91 32109 87654", totalFee: 75000, paidFee: 75000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", courseId: courseMap.get("MPPSC Evening") },
                { name: "Meghna Rao", email: "meghna@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Part Paid", attendance: "78%", phone: "+91 21098 76543", totalFee: 120000, paidFee: 80000, nextInstallmentLabel: "Installment 3", nextInstallmentAmount: 20000, nextDueDate: "2026-04-27", courseId: courseMap.get("UPSC 2026-A") },
            ];
            for (const data of studentSeeds) {
                if (!data.courseId)
                    continue;
                await prisma_1.prisma.adminStudent.upsert({
                    where: { email: data.email },
                    update: {},
                    create: data,
                });
            }
            const announcementSeeds = [
                { title: "Weekend Mock Test Schedule", target: "Students Only", content: "Sunday mock tests will begin at 9:00 AM sharp for all active batches.", type: "Academic", isPinned: true },
                { title: "Fee Counter Update", target: "All Users", content: "Fee counter will remain open until 6:30 PM this week for installment support.", type: "Financial", isPinned: false },
            ];
            for (const data of announcementSeeds) {
                const exists = await prisma_1.prisma.announcement.findFirst({ where: { title: data.title } });
                if (!exists)
                    await prisma_1.prisma.announcement.create({ data });
            }
            const videoSeeds = [
                { title: "UPSC Strategy Session", description: "Preparation roadmap, target-setting, and revision discipline.", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: getYouTubeThumbnail("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), isVisible: true, isFeatured: true, displayOrder: 1 },
                { title: "Student Success Story", description: "How disciplined practice helped secure selection.", youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U", thumbnailUrl: getYouTubeThumbnail("https://www.youtube.com/watch?v=ysz5S6PUM-U"), isVisible: true, isFeatured: true, displayOrder: 2 },
            ];
            for (const data of videoSeeds) {
                await prisma_1.prisma.adminVideo.upsert({
                    where: { youtubeUrl: data.youtubeUrl },
                    update: {},
                    create: data,
                });
            }
            console.log("[Seed] Admin data synchronization successful.");
        }
        catch (err) {
            console.error("[Seed] Critical failure during admin seeding:", err);
            seedResult = null; // Reset to allow retry on next attempt
            throw err;
        }
    })();
    return seedResult;
};
exports.seedAdminData = seedAdminData;
const getAdminOverview = async (_req, res) => {
    try {
        await (0, exports.seedAdminData)();
        const [students, courses, announcements, staff, settings, notes, videos] = await Promise.all([
            prisma_1.prisma.adminStudent.findMany({ orderBy: { createdAt: "asc" } }),
            prisma_1.prisma.adminCourse.findMany({ orderBy: { createdAt: "asc" } }),
            prisma_1.prisma.announcement.findMany({ orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] }),
            prisma_1.prisma.adminStaff.findMany({ orderBy: { createdAt: "asc" } }),
            prisma_1.prisma.websiteSettings.findFirst({ orderBy: { updatedAt: "desc" } }),
            prisma_1.prisma.adminNote.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] }),
            prisma_1.prisma.adminVideo.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] }),
        ]);
        res.json({
            students,
            courses,
            announcements,
            staff,
            notes,
            videos,
            websiteSettings: settings
                ? {
                    id: settings.id,
                    bannerText: settings.bannerText,
                    slides: JSON.parse(settings.slidesJson),
                    faculty: JSON.parse(settings.facultyJson),
                }
                : null,
        });
    }
    catch (error) {
        handleError(res, error, "Failed to load admin data");
    }
};
exports.getAdminOverview = getAdminOverview;
const getPublicContent = async (_req, res) => {
    try {
        void (0, exports.seedAdminData)().catch(e => console.warn("[PublicContent] Seeding delayed/failed:", e.message));
        const [settings, notes, videos] = await Promise.all([
            prisma_1.prisma.websiteSettings.findFirst({ orderBy: { updatedAt: "desc" } }),
            prisma_1.prisma.adminNote.findMany({
                where: { isVisible: true },
                orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
            }),
            prisma_1.prisma.adminVideo.findMany({
                where: { isVisible: true },
                orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }, { createdAt: "asc" }],
            }),
        ]);
        res.json({
            notes,
            videos,
            websiteSettings: settings
                ? {
                    id: settings.id,
                    bannerText: settings.bannerText,
                    slides: JSON.parse(settings.slidesJson),
                    faculty: JSON.parse(settings.facultyJson),
                }
                : null,
        });
    }
    catch (error) {
        handleError(res, error, "Failed to load public content");
    }
};
exports.getPublicContent = getPublicContent;
const getAdminStudents = async (_req, res) => {
    try {
        const students = await prisma_1.prisma.adminStudent.findMany({ orderBy: { createdAt: "asc" } });
        res.json(students);
    }
    catch (error) {
        handleError(res, error, "Failed to fetch students");
    }
};
exports.getAdminStudents = getAdminStudents;
const addAdminStudent = async (req, res) => {
    try {
        const payload = studentSchema.parse(req.body);
        const existingEmail = await prisma_1.prisma.adminStudent.findUnique({ where: { email: payload.email } });
        if (existingEmail)
            return res.status(409).json({ error: "A student with this email already exists" });
        const course = await prisma_1.prisma.adminCourse.findUnique({ where: { title: payload.course } });
        if (!course)
            return res.status(404).json({ error: "Selected course was not found" });
        const totalFee = payload.totalFee ?? parseCurrency(course.fee);
        const paidFee = payload.paidFee ?? 0;
        const student = await prisma_1.prisma.adminStudent.create({
            data: {
                ...payload,
                totalFee,
                paidFee,
                feeStatus: calculateFeeStatus(paidFee, totalFee),
                nextInstallmentLabel: payload.nextInstallmentLabel ?? "Installment 1",
                nextInstallmentAmount: payload.nextInstallmentAmount ?? totalFee,
                nextDueDate: payload.nextDueDate ?? new Date().toISOString().slice(0, 10),
                courseId: course.id,
            },
        });
        await syncCourseStudentCount(payload.course);
        res.status(201).json(student);
    }
    catch (error) {
        handleError(res, error, "Failed to add student");
    }
};
exports.addAdminStudent = addAdminStudent;
const updateAdminStudent = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const payload = studentSchema.partial().parse(req.body);
        const student = await prisma_1.prisma.adminStudent.update({ where: { id }, data: payload });
        if (payload.course)
            await syncCourseStudentCount(payload.course);
        res.json(student);
    }
    catch (error) {
        handleError(res, error, "Failed to update student");
    }
};
exports.updateAdminStudent = updateAdminStudent;
const deleteAdminStudent = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const existing = await prisma_1.prisma.adminStudent.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ error: "Student not found" });
        await prisma_1.prisma.adminStudent.delete({ where: { id } });
        await syncCourseStudentCount(existing.course);
        res.json({ success: true });
    }
    catch (error) {
        handleError(res, error, "Failed to delete student");
    }
};
exports.deleteAdminStudent = deleteAdminStudent;
const getAdminCourses = async (_req, res) => {
    try {
        const courses = await prisma_1.prisma.adminCourse.findMany({ orderBy: { createdAt: "asc" } });
        res.json(courses);
    }
    catch (error) {
        handleError(res, error, "Failed to fetch courses");
    }
};
exports.getAdminCourses = getAdminCourses;
const addAdminCourse = async (req, res) => {
    try {
        const payload = courseSchema.parse(req.body);
        const course = await prisma_1.prisma.adminCourse.create({ data: payload });
        res.status(201).json(course);
    }
    catch (error) {
        handleError(res, error, "Failed to add course");
    }
};
exports.addAdminCourse = addAdminCourse;
const updateAdminCourse = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const payload = courseSchema.partial().parse(req.body);
        const course = await prisma_1.prisma.adminCourse.update({ where: { id }, data: payload });
        res.json(course);
    }
    catch (error) {
        handleError(res, error, "Failed to update course");
    }
};
exports.updateAdminCourse = updateAdminCourse;
const deleteAdminCourse = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.adminCourse.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        handleError(res, error, "Failed to delete course");
    }
};
exports.deleteAdminCourse = deleteAdminCourse;
const getAnnouncements = async (_req, res) => {
    try {
        const announcements = await prisma_1.prisma.announcement.findMany({ orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] });
        res.json(announcements);
    }
    catch (error) {
        handleError(res, error, "Failed to fetch announcements");
    }
};
exports.getAnnouncements = getAnnouncements;
const addAnnouncement = async (req, res) => {
    try {
        const payload = announcementSchema.parse(req.body);
        const announcement = await prisma_1.prisma.announcement.create({ data: payload });
        res.status(201).json(announcement);
    }
    catch (error) {
        handleError(res, error, "Failed to add announcement");
    }
};
exports.addAnnouncement = addAnnouncement;
const updateAnnouncement = async (req, res) => {
    try {
        const id = req.params.id;
        const payload = announcementSchema.partial().parse(req.body);
        const announcement = await prisma_1.prisma.announcement.update({ where: { id }, data: payload });
        res.json(announcement);
    }
    catch (error) {
        handleError(res, error, "Failed to update announcement");
    }
};
exports.updateAnnouncement = updateAnnouncement;
const deleteAnnouncement = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.announcement.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        handleError(res, error, "Failed to delete announcement");
    }
};
exports.deleteAnnouncement = deleteAnnouncement;
const getAdminStaff = async (_req, res) => {
    try {
        const staff = await prisma_1.prisma.adminStaff.findMany({ orderBy: { createdAt: "asc" } });
        res.json(staff);
    }
    catch (error) {
        handleError(res, error, "Failed to fetch staff records");
    }
};
exports.getAdminStaff = getAdminStaff;
const processPayroll = async (_req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        await prisma_1.prisma.adminStaff.updateMany({ where: { payrollStatus: { not: "Paid" } }, data: { payrollStatus: "Paid", payrollDate: today } });
        const staff = await prisma_1.prisma.adminStaff.findMany({ orderBy: { createdAt: "asc" } });
        res.json(staff);
    }
    catch (error) {
        handleError(res, error, "Failed to process payroll");
    }
};
exports.processPayroll = processPayroll;
const markAttendance = async (_req, res) => {
    try {
        // Basic mock logic for demonstrative attendance update
        const students = await prisma_1.prisma.adminStudent.findMany();
        const updated = await Promise.all(students.map(s => prisma_1.prisma.adminStudent.update({ where: { id: s.id }, data: { attendance: '90%' } })));
        res.json(updated);
    }
    catch (error) {
        handleError(res, error, "Failed to mark attendance");
    }
};
exports.markAttendance = markAttendance;
const sendFeeReminders = async (req, res) => {
    try {
        const ids = zod_1.z.array(zod_1.z.number()).parse(req.body.studentIds);
        await prisma_1.prisma.adminStudent.updateMany({ where: { id: { in: ids } }, data: { remindersSent: { increment: 1 }, lastReminderAt: new Date() } });
        const students = await prisma_1.prisma.adminStudent.findMany({ where: { id: { in: ids } } });
        res.json(students);
    }
    catch (error) {
        handleError(res, error, "Failed to send reminders");
    }
};
exports.sendFeeReminders = sendFeeReminders;
const getWebsiteSettings = async (_req, res) => {
    try {
        const settings = await prisma_1.prisma.websiteSettings.findFirst({ orderBy: { updatedAt: "desc" } });
        if (!settings)
            return res.status(404).json({ error: "Settings not found" });
        res.json({ id: settings.id, bannerText: settings.bannerText, slides: JSON.parse(settings.slidesJson), faculty: JSON.parse(settings.facultyJson) });
    }
    catch (error) {
        handleError(res, error, "Failed to fetch settings");
    }
};
exports.getWebsiteSettings = getWebsiteSettings;
const updateWebsiteSettings = async (req, res) => {
    try {
        const payload = websiteSettingsSchema.parse(req.body);
        const existing = await prisma_1.prisma.websiteSettings.findFirst();
        const data = { bannerText: payload.bannerText, slidesJson: JSON.stringify(payload.slides), facultyJson: JSON.stringify(payload.faculty) };
        const updated = existing ? await prisma_1.prisma.websiteSettings.update({ where: { id: existing.id }, data }) : await prisma_1.prisma.websiteSettings.create({ data });
        res.json({ id: updated.id, bannerText: updated.bannerText, slides: JSON.parse(updated.slidesJson), faculty: JSON.parse(updated.facultyJson) });
    }
    catch (error) {
        handleError(res, error, "Failed to update settings");
    }
};
exports.updateWebsiteSettings = updateWebsiteSettings;
const getAdminNotes = async (_req, res) => {
    try {
        const notes = await prisma_1.prisma.adminNote.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
        res.json(notes);
    }
    catch (error) {
        handleError(res, error, "Failed to fetch notes");
    }
};
exports.getAdminNotes = getAdminNotes;
const addAdminNote = async (req, res) => {
    try {
        const payload = noteSchema.parse(req.body);
        const note = await prisma_1.prisma.adminNote.create({ data: payload });
        res.status(201).json(note);
    }
    catch (error) {
        handleError(res, error, "Failed to add note");
    }
};
exports.addAdminNote = addAdminNote;
const updateAdminNote = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const payload = noteSchema.partial().parse(req.body);
        const note = await prisma_1.prisma.adminNote.update({ where: { id }, data: payload });
        res.json(note);
    }
    catch (error) {
        handleError(res, error, "Failed to update note");
    }
};
exports.updateAdminNote = updateAdminNote;
const deleteAdminNote = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.adminNote.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        handleError(res, error, "Failed to delete note");
    }
};
exports.deleteAdminNote = deleteAdminNote;
const getAdminVideos = async (_req, res) => {
    try {
        const videos = await prisma_1.prisma.adminVideo.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
        res.json(videos);
    }
    catch (error) {
        handleError(res, error, "Failed to fetch videos");
    }
};
exports.getAdminVideos = getAdminVideos;
const addAdminVideo = async (req, res) => {
    try {
        const payload = videoSchema.parse(req.body);
        const video = await prisma_1.prisma.adminVideo.create({ data: payload });
        res.status(201).json(video);
    }
    catch (error) {
        handleError(res, error, "Failed to add video");
    }
};
exports.addAdminVideo = addAdminVideo;
const updateAdminVideo = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const payload = videoSchema.partial().parse(req.body);
        const video = await prisma_1.prisma.adminVideo.update({ where: { id }, data: payload });
        res.json(video);
    }
    catch (error) {
        handleError(res, error, "Failed to update video");
    }
};
exports.updateAdminVideo = updateAdminVideo;
const deleteAdminVideo = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.adminVideo.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        handleError(res, error, "Failed to delete video");
    }
};
exports.deleteAdminVideo = deleteAdminVideo;
