import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma";

const feeStatusSchema = z.enum(["Paid", "Part Paid", "Overdue"]);
const courseStatusSchema = z.enum(["Active", "Upcoming", "Completed"]);
const payrollStatusSchema = z.enum(["Paid", "Pending", "Processing"]);
const attendanceStatusSchema = z.enum(["Present", "Late", "On Leave"]);

const studentSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  course: z.string().trim().min(2),
  batch: z.string().trim().min(2),
  joinDate: z.string().trim().min(3),
  feeStatus: feeStatusSchema,
  attendance: z.string().trim().regex(/^\d{1,3}%$/),
  phone: z.string().trim().min(10),
  totalFee: z.coerce.number().int().nonnegative().optional(),
  paidFee: z.coerce.number().int().nonnegative().optional(),
  nextInstallmentLabel: z.string().trim().min(2).optional(),
  nextInstallmentAmount: z.coerce.number().int().nonnegative().optional(),
  nextDueDate: z.string().trim().min(1).optional(),
});

const courseSchema = z.object({
  title: z.string().trim().min(2),
  students: z.coerce.number().int().nonnegative().optional(),
  faculty: z.string().trim().min(2),
  status: courseStatusSchema.optional(),
  duration: z.string().trim().min(2),
  fee: z.string().trim().min(1),
});

const announcementSchema = z.object({
  title: z.string().trim().min(2),
  target: z.string().trim().min(2),
  content: z.string().trim().min(5),
  isPinned: z.boolean().optional(),
  type: z.string().trim().min(2),
});

const staffSchema = z.object({
  name: z.string().trim().min(2),
  role: z.string().trim().min(2),
  salary: z.coerce.number().int().positive(),
  payrollStatus: payrollStatusSchema.optional(),
  payrollDate: z.string().trim().min(1),
  attendanceStatus: attendanceStatusSchema.optional(),
  clockIn: z.string().trim().min(1).optional(),
  clockOut: z.string().trim().min(1).optional(),
});

const websiteSettingsSchema = z.object({
  bannerText: z.string().trim().min(5),
  slides: z.array(z.string().trim().min(1)).min(1),
  faculty: z.array(
    z.object({
      name: z.string().trim().min(2),
      sub: z.string().trim().min(2),
      img: z.string().trim().min(1),
      bio: z.string().trim().optional(),
    })
  ).min(1),
  upcomingBatches: z.array(
    z.object({
      title: z.string().trim().min(1),
      desc: z.string().trim().min(1),
      status: z.string().trim().min(1),
      totalSeats: z.number().int().min(1),
      seatsLeft: z.number().int().min(0),
      img: z.string().trim().optional(),
      isCustomSplit: z.boolean().optional(),
    })
  ).optional(),
  socialLinks: z.array(
    z.object({
      platform: z.string().trim(),
      url: z.string().trim()
    })
  ).optional(),
  whatsappTemplates: z.array(
    z.object({
      id: z.string().trim(),
      label: z.string().trim(),
      message: z.string().trim()
    })
  ).optional()
});

const noteSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().min(5),
  category: z.string().trim().min(2),
  thumbnailUrl: z.string().trim().optional().nullable(),
  fileUrl: z.string().trim().optional().nullable(),
  viewUrl: z.string().trim().optional().nullable(),
  isVisible: z.boolean().optional(),
  displayOrder: z.coerce.number().int().nonnegative().optional(),
});

const videoSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().min(5),
  youtubeUrl: z.string().trim().url(),
  thumbnailUrl: z.string().trim().optional().nullable(),
  isVisible: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.coerce.number().int().nonnegative().optional(),
});

const handleError = (res: Response, error: unknown, fallbackMessage: string) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: error.issues[0]?.message ?? fallbackMessage });
  }
  const message = error instanceof Error ? error.message : fallbackMessage;
  console.error(`[AdminController] ${fallbackMessage}:`, error);
  return res.status(500).json({ error: message });
};

const parseCurrency = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const calculateFeeStatus = (paidFee: number, totalFee: number) => {
  if (paidFee >= totalFee) return "Paid";
  if (paidFee > 0) return "Part Paid";
  return "Overdue";
};

const getYouTubeThumbnail = (youtubeUrl: string) => {
  const match = youtubeUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
};

const syncCourseStudentCount = async (courseTitle: string) => {
  const count = await prisma.adminStudent.count({ where: { course: courseTitle } });
  await prisma.adminCourse.updateMany({
    where: { title: courseTitle },
    data: { students: count },
  });
};

// Global seeding lock to avoid "Database is locked" in SQLite
let seedResult: Promise<void> | null = null;

export const seedAdminData = async () => {
  if (seedResult) return seedResult;
  
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
        await prisma.adminCourse.upsert({
          where: { title: data.title },
          update: {},
          create: data,
        });
      }

      const courses = await prisma.adminCourse.findMany();
      const courseMap = new Map(courses.map((c: any) => [c.title, c.id]));
      
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
        if (!data.courseId) continue;
        await prisma.adminStudent.upsert({
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
        const exists = await prisma.announcement.findFirst({ where: { title: data.title } });
        if (!exists) await prisma.announcement.create({ data });
      }

      const videoSeeds = [
        { title: "UPSC Strategy Session", description: "Preparation roadmap, target-setting, and revision discipline.", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: getYouTubeThumbnail("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), isVisible: true, isFeatured: true, displayOrder: 1 },
        { title: "Student Success Story", description: "How disciplined practice helped secure selection.", youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U", thumbnailUrl: getYouTubeThumbnail("https://www.youtube.com/watch?v=ysz5S6PUM-U"), isVisible: true, isFeatured: true, displayOrder: 2 },
      ];
      for (const data of videoSeeds) {
        await prisma.adminVideo.upsert({
          where: { youtubeUrl: data.youtubeUrl },
          update: {},
          create: data,
        });
      }

      const existingSettings = await prisma.websiteSettings.findFirst();
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
          await prisma.websiteSettings.update({ where: { id: existingSettings.id }, data: defaultSettings });
        } else {
          await prisma.websiteSettings.create({ data: defaultSettings });
        }
      }

      console.log("[Seed] Admin data synchronization successful.");
    } catch (err) {
      console.error("[Seed] Critical failure during admin seeding:", err);
      seedResult = null; // Reset to allow retry on next attempt
      throw err;
    }
  })();

  return seedResult;
};

export const getAdminOverview = async (_req: Request, res: Response) => {
  try {
    await seedAdminData();
    const [students, courses, announcements, staff, settings, notes, videos] = await Promise.all([
      prisma.adminStudent.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.adminCourse.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.announcement.findMany({ orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] }),
      prisma.adminStaff.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.websiteSettings.findFirst({ orderBy: { updatedAt: "desc" } }),
      prisma.adminNote.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] }),
      prisma.adminVideo.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] }),
    ]);

    res.json({
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
  } catch (error) {
    handleError(res, error, "Failed to load admin data");
  }
};

export const getPublicContent = async (_req: Request, res: Response) => {
  try {
    void seedAdminData().catch(e => console.warn("[PublicContent] Seeding delayed/failed:", e.message));
    const [settings, notes, videos] = await Promise.all([
      prisma.websiteSettings.findFirst({ orderBy: { updatedAt: "desc" } }),
      prisma.adminNote.findMany({
        where: { isVisible: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.adminVideo.findMany({
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
  } catch (error) {
    handleError(res, error, "Failed to load public content");
  }
};

export const getAdminStudents = async (_req: Request, res: Response) => {
  try {
    const students = await prisma.adminStudent.findMany({ orderBy: { createdAt: "asc" } });
    res.json(students);
  } catch (error) {
    handleError(res, error, "Failed to fetch students");
  }
};

export const addAdminStudent = async (req: Request, res: Response) => {
  try {
    const payload = studentSchema.parse(req.body);
    const existingEmail = await prisma.adminStudent.findUnique({ where: { email: payload.email } });
    if (existingEmail) return res.status(409).json({ error: "A student with this email already exists" });

    const course = await prisma.adminCourse.findUnique({ where: { title: payload.course } });
    if (!course) return res.status(404).json({ error: "Selected course was not found" });

    const totalFee = payload.totalFee ?? parseCurrency(course.fee);
    const paidFee = payload.paidFee ?? 0;
    const student = await prisma.adminStudent.create({
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
  } catch (error) {
    handleError(res, error, "Failed to add student");
  }
};

export const updateAdminStudent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = studentSchema.partial().parse(req.body);
    const student = await prisma.adminStudent.update({ where: { id }, data: payload });
    if (payload.course) await syncCourseStudentCount(payload.course);
    res.json(student);
  } catch (error) {
    handleError(res, error, "Failed to update student");
  }
};

export const deleteAdminStudent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.adminStudent.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Student not found" });
    await prisma.adminStudent.delete({ where: { id } });
    await syncCourseStudentCount(existing.course);
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Failed to delete student");
  }
};

export const getAdminCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await prisma.adminCourse.findMany({ orderBy: { createdAt: "asc" } });
    res.json(courses);
  } catch (error) {
    handleError(res, error, "Failed to fetch courses");
  }
};

export const addAdminCourse = async (req: Request, res: Response) => {
  try {
    const payload = courseSchema.parse(req.body);
    const course = await prisma.adminCourse.create({ data: payload });
    res.status(201).json(course);
  } catch (error) {
    handleError(res, error, "Failed to add course");
  }
};

export const updateAdminCourse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = courseSchema.partial().parse(req.body);
    const course = await prisma.adminCourse.update({ where: { id }, data: payload });
    res.json(course);
  } catch (error) {
    handleError(res, error, "Failed to update course");
  }
};

export const deleteAdminCourse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.adminCourse.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Failed to delete course");
  }
};

export const getAnnouncements = async (_req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({ orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] });
    res.json(announcements);
  } catch (error) {
    handleError(res, error, "Failed to fetch announcements");
  }
};

export const addAnnouncement = async (req: Request, res: Response) => {
  try {
    const payload = announcementSchema.parse(req.body);
    const announcement = await prisma.announcement.create({ data: payload });
    res.status(201).json(announcement);
  } catch (error) {
    handleError(res, error, "Failed to add announcement");
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const payload = announcementSchema.partial().parse(req.body);
    const announcement = await prisma.announcement.update({ where: { id }, data: payload });
    res.json(announcement);
  } catch (error) {
    handleError(res, error, "Failed to update announcement");
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await prisma.announcement.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Failed to delete announcement");
  }
};

export const getAdminStaff = async (_req: Request, res: Response) => {
  try {
    const staff = await prisma.adminStaff.findMany({ orderBy: { createdAt: "asc" } });
    res.json(staff);
  } catch (error) {
    handleError(res, error, "Failed to fetch staff records");
  }
};

export const processPayroll = async (_req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    await prisma.adminStaff.updateMany({ where: { payrollStatus: { not: "Paid" } }, data: { payrollStatus: "Paid", payrollDate: today } });
    const staff = await prisma.adminStaff.findMany({ orderBy: { createdAt: "asc" } });
    res.json(staff);
  } catch (error) {
    handleError(res, error, "Failed to process payroll");
  }
};

export const markAttendance = async (_req: Request, res: Response) => {
  try {
    // Basic mock logic for demonstrative attendance update
    const students = await prisma.adminStudent.findMany();
    const updated = await Promise.all(students.map(s => prisma.adminStudent.update({ where: { id: s.id }, data: { attendance: '90%' } })));
    res.json(updated);
  } catch (error) {
    handleError(res, error, "Failed to mark attendance");
  }
};

export const sendFeeReminders = async (req: Request, res: Response) => {
  try {
    const ids = z.array(z.number()).parse(req.body.studentIds);
    await prisma.adminStudent.updateMany({ where: { id: { in: ids } }, data: { remindersSent: { increment: 1 }, lastReminderAt: new Date() } });
    const students = await prisma.adminStudent.findMany({ where: { id: { in: ids } } });
    res.json(students);
  } catch (error) {
    handleError(res, error, "Failed to send reminders");
  }
};

export const getWebsiteSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.websiteSettings.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!settings) return res.status(404).json({ error: "Settings not found" });
    res.json({ 
      id: settings.id, 
      bannerText: settings.bannerText, 
      slides: JSON.parse(settings.slidesJson), 
      faculty: JSON.parse(settings.facultyJson), 
      upcomingBatches: settings.upcomingBatchesJson ? JSON.parse(settings.upcomingBatchesJson) : [],
      socialLinks: settings.socialLinksJson ? JSON.parse(settings.socialLinksJson) : [],
      whatsappTemplates: settings.whatsappTemplatesJson ? JSON.parse(settings.whatsappTemplatesJson) : []
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch settings");
  }
};

export const updateWebsiteSettings = async (req: Request, res: Response) => {
  try {
    const payload = websiteSettingsSchema.parse(req.body);
    const existing = await prisma.websiteSettings.findFirst();
    const data = { 
      bannerText: payload.bannerText, 
      slidesJson: JSON.stringify(payload.slides), 
      facultyJson: JSON.stringify(payload.faculty), 
      upcomingBatchesJson: payload.upcomingBatches ? JSON.stringify(payload.upcomingBatches) : null,
      socialLinksJson: payload.socialLinks ? JSON.stringify(payload.socialLinks) : null,
      whatsappTemplatesJson: payload.whatsappTemplates ? JSON.stringify(payload.whatsappTemplates) : null
    };
    const updated = existing ? await prisma.websiteSettings.update({ where: { id: existing.id }, data }) : await prisma.websiteSettings.create({ data });
    res.json({ 
      id: updated.id, 
      bannerText: updated.bannerText, 
      slides: JSON.parse(updated.slidesJson), 
      faculty: JSON.parse(updated.facultyJson), 
      upcomingBatches: updated.upcomingBatchesJson ? JSON.parse(updated.upcomingBatchesJson) : [],
      socialLinks: updated.socialLinksJson ? JSON.parse(updated.socialLinksJson) : [],
      whatsappTemplates: updated.whatsappTemplatesJson ? JSON.parse(updated.whatsappTemplatesJson) : []
    });
  } catch (error) {
    handleError(res, error, "Failed to update settings");
  }
};

export const getAdminNotes = async (_req: Request, res: Response) => {
  try {
    const notes = await prisma.adminNote.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
    res.json(notes);
  } catch (error) {
    handleError(res, error, "Failed to fetch notes");
  }
};

export const addAdminNote = async (req: Request, res: Response) => {
  try {
    const payload = noteSchema.parse(req.body);
    const note = await prisma.adminNote.create({ data: payload });
    res.status(201).json(note);
  } catch (error) {
    handleError(res, error, "Failed to add note");
  }
};

export const updateAdminNote = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = noteSchema.partial().parse(req.body);
    const note = await prisma.adminNote.update({ where: { id }, data: payload });
    res.json(note);
  } catch (error) {
    handleError(res, error, "Failed to update note");
  }
};

export const deleteAdminNote = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.adminNote.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Failed to delete note");
  }
};

export const getAdminVideos = async (_req: Request, res: Response) => {
  try {
    const videos = await prisma.adminVideo.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
    res.json(videos);
  } catch (error) {
    handleError(res, error, "Failed to fetch videos");
  }
};

export const addAdminVideo = async (req: Request, res: Response) => {
  try {
    const payload = videoSchema.parse(req.body);
    const video = await prisma.adminVideo.create({ data: payload });
    res.status(201).json(video);
  } catch (error) {
    handleError(res, error, "Failed to add video");
  }
};

export const updateAdminVideo = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = videoSchema.partial().parse(req.body);
    const video = await prisma.adminVideo.update({ where: { id }, data: payload });
    res.json(video);
  } catch (error) {
    handleError(res, error, "Failed to update video");
  }
};

export const deleteAdminVideo = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.adminVideo.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Failed to delete video");
  }
};
