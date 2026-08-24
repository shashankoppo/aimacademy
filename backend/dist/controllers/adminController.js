"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFileUpload = exports.deleteAdminVideo = exports.updateAdminVideo = exports.addAdminVideo = exports.getAdminVideos = exports.deleteAdminNote = exports.updateAdminNote = exports.addAdminNote = exports.getAdminNotes = exports.updateWebsiteSettings = exports.getWebsiteSettings = exports.sendFeeReminders = exports.markAttendance = exports.updateAdminStaff = exports.processPayroll = exports.getAdminStaff = exports.deleteAnnouncement = exports.updateAnnouncement = exports.addAnnouncement = exports.getAnnouncements = exports.deleteAdminCourse = exports.updateAdminCourse = exports.addAdminCourse = exports.getAdminCourses = exports.deleteAdminStudent = exports.updateAdminStudent = exports.addAdminStudent = exports.getAdminStudents = exports.getPublicContent = exports.getAdminOverview = exports.seedAdminData = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
const password_1 = require("../security/password");
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
    customFeesJson: zod_1.z.string().optional(),
    photoUrl: zod_1.z.string().nullable().optional(),
    applicationFormUrl: zod_1.z.string().nullable().optional(),
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
        bio: zod_1.z.string().trim().optional(),
    })).min(1),
    upcomingBatches: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string().trim().min(1),
        desc: zod_1.z.string().trim().min(1),
        status: zod_1.z.string().trim().min(1),
        totalSeats: zod_1.z.number().int().min(1),
        seatsLeft: zod_1.z.number().int().min(0),
        img: zod_1.z.string().trim().optional(),
        isCustomSplit: zod_1.z.boolean().optional(),
    })).optional(),
    socialLinks: zod_1.z.array(zod_1.z.object({
        platform: zod_1.z.string().trim(),
        url: zod_1.z.string().trim()
    })).optional(),
    whatsappTemplates: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().trim(),
        label: zod_1.z.string().trim(),
        message: zod_1.z.string().trim()
    })).optional()
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
            const existingSettings = await prisma_1.prisma.websiteSettings.findFirst();
            if (!existingSettings || existingSettings.facultyJson.includes("Rahul Sir")) {
                const defaultSettings = {
                    bannerText: "🎉 Happy Birthday to our Founder, Mr. Imran Khan! 🎂 | 🚀 AIM Academy is officially launching today! Admissions Open | Call: +91 70672 31189",
                    slidesJson: JSON.stringify([
                        "/images/HEROMAIN 007.jpeg",
                        "/images/STUDENT BANNER 01.jpeg",
                        "/images/STUDENT_BANNER.jpeg",
                    ]),
                    facultyJson: JSON.stringify([
                        { name: "Dr. Imran Khan", sub: "Founder, Director & GS Faculty", img: "/images/founder_solo.png", bio: "A dedicated mentor committed to shaping the future of civil services aspirants through strategic and ethical guidance." },
                        { name: "Mr. Sandeep Yadav", sub: "Maths Faculty", img: "/images/faculty_5.png", bio: "Expert in Quantitative Aptitude with over a decade of teaching experience." },
                        { name: "Mr. Irshad Mansoori", sub: "Maths Faculty", img: "/images/faculty_2.png", bio: "Renowned for simplifying complex mathematical concepts for competitive exams." },
                        { name: "Mr. Shubham Patel", sub: "MP / Current Affairs", img: "/images/faculty_3.png", bio: "Specialist in Current Affairs and Madhya Pradesh specific General Studies." },
                        { name: "Mr. Abhishek Sengar", sub: "English Faculty", img: "/images/faculty_4.png", bio: "Dedicated English educator focused on grammar and comprehension strategies." },
                        { name: "Mr. Atul Rajpoot", sub: "MP / English Faculty", img: "/images/faculty_5.png", bio: "Versatile faculty guiding students in both English and Regional Studies." },
                        { name: "Mr. Yogesh Tiwari", sub: "Science Faculty", img: "/images/faculty_1.png", bio: "Expert in General Science and technology concepts for competitive exams." },
                        { name: "Mr. Pushparaj Kushwaha", sub: "History & Polity", img: "/images/faculty_2.png", bio: "Bringing historical events and constitutional frameworks to life." },
                    ]),
                    upcomingBatchesJson: JSON.stringify([
                        { title: "Comprehensive Foundation Batch 2026", desc: "A definitive classroom batch covering complete General Studies from absolute basics to advanced level.", status: "ADMISSIONS OPEN", seatsLeft: 12, totalSeats: 100, img: "/images/HEROMAIN 007.jpeg" },
                        { title: "SSC Intensive Target Program", desc: "Rigorous daily practice and mock test-driven preparation for secure selections across CGL and CHSL.", status: "LIMITED SEATS", seatsLeft: 5, totalSeats: 80, img: "/images/STUDENT_BANNER.jpeg" },
                        { title: "Free Career Counselling Seminar", desc: "Guidance directly from toppers and expert mentors to completely roadmap your preparation journey.", status: "NEXT SUNDAY", seatsLeft: 2, totalSeats: 100, isCustomSplit: true },
                    ]),
                    socialLinksJson: JSON.stringify([
                        { platform: "Facebook", url: "https://facebook.com/aimacademyjbp" },
                        { platform: "Instagram", url: "https://instagram.com/aimacademyjbp" },
                        { platform: "YouTube", url: "https://youtube.com/aimacademyjbp" }
                    ]),
                    whatsappTemplatesJson: JSON.stringify([
                        {
                            id: "admission",
                            label: "Admission Confirmation",
                            message: "Dear {name},\n\nYour admission to *AIM Academy* has been confirmed for the course: *{course}*.\n\nWelcome to the family! We wish you the very best on your journey to success. 🎓\n\nFor any queries, call us: +91 70672 31189\n\n– *AIM Academy, Jabalpur*\n_Synonym of Success_"
                        },
                        {
                            id: "fee",
                            label: "Fee Payment Reminder",
                            message: "Dear {name},\n\nThis is a gentle reminder that your fee installment for *{course}* at *AIM Academy* is due.\n\nKindly clear the dues at the earliest to continue your studies uninterrupted. 📋\n\nContact: +91 70672 31189\n\n– *AIM Academy, Jabalpur*"
                        },
                        {
                            id: "batch",
                            label: "Batch Start Notification",
                            message: "Dear {name},\n\nYour new batch for *{course}* at *AIM Academy* is starting soon! 🚀\n\nPlease report to the institute on time and bring your study materials.\n\nFor schedule details: +91 70672 31189\n\n– *AIM Academy, Jabalpur*"
                        },
                        {
                            id: "result",
                            label: "Result / Selection Update",
                            message: "🎉 Heartiest Congratulations, *{name}*!\n\nYou have successfully cleared your exam and brought glory to *AIM Academy*, Jabalpur.\n\nYour hard work and dedication have paid off. The entire AIM family is proud of you! 🏆\n\n– *AIM Academy, Jabalpur*\n_Synonym of Success_"
                        }
                    ])
                };
                if (existingSettings) {
                    await prisma_1.prisma.websiteSettings.update({ where: { id: existingSettings.id }, data: defaultSettings });
                }
                else {
                    await prisma_1.prisma.websiteSettings.create({ data: defaultSettings });
                }
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
                    upcomingBatches: settings.upcomingBatchesJson ? JSON.parse(settings.upcomingBatchesJson) : [],
                    socialLinks: settings.socialLinksJson ? JSON.parse(settings.socialLinksJson) : [],
                    whatsappTemplates: settings.whatsappTemplatesJson ? JSON.parse(settings.whatsappTemplatesJson) : []
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
                    upcomingBatches: settings.upcomingBatchesJson ? JSON.parse(settings.upcomingBatchesJson) : [],
                    socialLinks: settings.socialLinksJson ? JSON.parse(settings.socialLinksJson) : [],
                    whatsappTemplates: settings.whatsappTemplatesJson ? JSON.parse(settings.whatsappTemplatesJson) : []
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
        const userEmail = payload.email.toLowerCase();
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email: userEmail } });
        if (!existingUser) {
            const user = await prisma_1.prisma.user.create({
                data: {
                    name: payload.name,
                    email: userEmail,
                    phone: payload.phone || null,
                    role: "STUDENT",
                    password: await (0, password_1.hashPassword)("aim123"),
                    isActive: true,
                },
            });
            await prisma_1.prisma.studentProfile.create({
                data: {
                    userId: user.id,
                },
            });
        }
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
        // Fetch existing student to check if email/phone changed
        const existing = await prisma_1.prisma.adminStudent.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ error: "Student not found" });
        const student = await prisma_1.prisma.adminStudent.update({ where: { id }, data: payload });
        // Sync with User table if applicable
        if ((payload.email && payload.email !== existing.email) ||
            (payload.phone && payload.phone !== existing.phone) ||
            (payload.name && payload.name !== existing.name)) {
            // Find user by old email or old phone
            const user = await prisma_1.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: existing.email },
                        { phone: existing.phone }
                    ]
                }
            });
            if (user) {
                await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        ...(payload.email ? { email: payload.email } : {}),
                        ...(payload.phone ? { phone: payload.phone } : {}),
                        ...(payload.name ? { name: payload.name } : {}),
                    }
                });
            }
        }
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
const processPayroll = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        let ids = [];
        // Optional payload: { staffIds: [1, 2, 3] }
        if (req.body.staffIds && Array.isArray(req.body.staffIds)) {
            ids = req.body.staffIds.map(Number);
        }
        if (ids.length > 0) {
            await prisma_1.prisma.adminStaff.updateMany({
                where: { id: { in: ids }, payrollStatus: { not: "Paid" } },
                data: { payrollStatus: "Paid", payrollDate: today }
            });
        }
        else {
            // Fallback: pay all pending (bulk action backward compatibility)
            await prisma_1.prisma.adminStaff.updateMany({
                where: { payrollStatus: { not: "Paid" } },
                data: { payrollStatus: "Paid", payrollDate: today }
            });
        }
        const staff = await prisma_1.prisma.adminStaff.findMany({ orderBy: { createdAt: "asc" } });
        res.json(staff);
    }
    catch (error) {
        handleError(res, error, "Failed to process payroll");
    }
};
exports.processPayroll = processPayroll;
const updateAdminStaff = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { salary, payrollStatus, attendanceStatus, clockIn, clockOut } = req.body;
        const updated = await prisma_1.prisma.adminStaff.update({
            where: { id },
            data: {
                ...(salary !== undefined && { salary }),
                ...(payrollStatus && { payrollStatus }),
                ...(attendanceStatus && { attendanceStatus }),
                ...(clockIn && { clockIn }),
                ...(clockOut && { clockOut }),
                ...(payrollStatus === "Paid" && { payrollDate: new Date().toISOString().slice(0, 10) }),
            },
        });
        res.json(updated);
    }
    catch (error) {
        handleError(res, error, "Failed to update staff member");
    }
};
exports.updateAdminStaff = updateAdminStaff;
const markAttendance = async (_req, res) => {
    try {
        const students = await prisma_1.prisma.adminStudent.findMany();
        const updated = await Promise.all(students.map((s) => {
            const current = parseInt(s.attendance, 10) || 0;
            // Realistic simulation: boost attendance slightly up to 100%
            const newVal = Math.min(100, current + Math.floor(Math.random() * 3) + 1);
            return prisma_1.prisma.adminStudent.update({
                where: { id: s.id },
                data: { attendance: `${newVal}%` },
            });
        }));
        res.json(updated);
    }
    catch (error) {
        handleError(res, error, "Failed to mark attendance");
    }
};
exports.markAttendance = markAttendance;
const sendFeeReminders = async (req, res) => {
    try {
        console.log("sendFeeReminders body:", req.body);
        const ids = zod_1.z.array(zod_1.z.number()).parse(req.body.studentIds);
        console.log("sendFeeReminders ids:", ids);
        await prisma_1.prisma.adminStudent.updateMany({ where: { id: { in: ids } }, data: { remindersSent: { increment: 1 }, lastReminderAt: new Date() } });
        const students = await prisma_1.prisma.adminStudent.findMany({ where: { id: { in: ids } } });
        res.json(students);
    }
    catch (error) {
        console.error("sendFeeReminders error:", error);
        handleError(res, error, "Failed to send reminders");
    }
};
exports.sendFeeReminders = sendFeeReminders;
const getWebsiteSettings = async (_req, res) => {
    try {
        const settings = await prisma_1.prisma.websiteSettings.findFirst({ orderBy: { updatedAt: "desc" } });
        if (!settings)
            return res.status(404).json({ error: "Settings not found" });
        res.json({
            id: settings.id,
            bannerText: settings.bannerText,
            slides: JSON.parse(settings.slidesJson),
            faculty: JSON.parse(settings.facultyJson),
            upcomingBatches: settings.upcomingBatchesJson ? JSON.parse(settings.upcomingBatchesJson) : [],
            socialLinks: settings.socialLinksJson ? JSON.parse(settings.socialLinksJson) : [],
            whatsappTemplates: settings.whatsappTemplatesJson ? JSON.parse(settings.whatsappTemplatesJson) : []
        });
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
        const data = {
            bannerText: payload.bannerText,
            slidesJson: JSON.stringify(payload.slides),
            facultyJson: JSON.stringify(payload.faculty),
            upcomingBatchesJson: payload.upcomingBatches ? JSON.stringify(payload.upcomingBatches) : null,
            socialLinksJson: payload.socialLinks ? JSON.stringify(payload.socialLinks) : null,
            whatsappTemplatesJson: payload.whatsappTemplates ? JSON.stringify(payload.whatsappTemplates) : null
        };
        const updated = existing ? await prisma_1.prisma.websiteSettings.update({ where: { id: existing.id }, data }) : await prisma_1.prisma.websiteSettings.create({ data });
        res.json({
            id: updated.id,
            bannerText: updated.bannerText,
            slides: JSON.parse(updated.slidesJson),
            faculty: JSON.parse(updated.facultyJson),
            upcomingBatches: updated.upcomingBatchesJson ? JSON.parse(updated.upcomingBatchesJson) : [],
            socialLinks: updated.socialLinksJson ? JSON.parse(updated.socialLinksJson) : [],
            whatsappTemplates: updated.whatsappTemplatesJson ? JSON.parse(updated.whatsappTemplatesJson) : []
        });
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
const handleFileUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const url = `/uploads/${req.file.filename}`;
        res.json({ success: true, url });
    }
    catch (error) {
        handleError(res, error, "Failed to handle file upload");
    }
};
exports.handleFileUpload = handleFileUpload;
