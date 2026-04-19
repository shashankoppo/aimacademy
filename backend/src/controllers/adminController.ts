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
    }),
  ).min(1),
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

let adminSeedPromise: Promise<void> | null = null;

export const seedAdminData = async () => {
  if (!adminSeedPromise) {
    adminSeedPromise = (async () => {
  const courseSeeds = [
    { title: "UPSC 2026-A", students: 3, faculty: "Dr. Sandeep Kumar", status: "Active", duration: "12-18 Months", fee: formatCurrency(120000) },
    { title: "SSC CGL Fast Track", students: 2, faculty: "Rahul Verma", status: "Active", duration: "6 Months", fee: formatCurrency(45000) },
    { title: "Banking IBPS", students: 1, faculty: "Suresh Pillai", status: "Upcoming", duration: "4-6 Months", fee: formatCurrency(40000) },
    { title: "MPPSC Evening", students: 2, faculty: "Meera Nair", status: "Active", duration: "6-12 Months", fee: formatCurrency(75000) },
  ];
  for (const data of courseSeeds) {
    const exists = await prisma.adminCourse.findUnique({ where: { title: data.title } });
    if (!exists) {
      await prisma.adminCourse.create({ data });
    }
  }

  const courses = await prisma.adminCourse.findMany();
  const courseMap = new Map(courses.map((course) => [course.title, course]));
  const studentSeeds = [
    { name: "Aarav Mehta", email: "aarav@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Paid", attendance: "88%", phone: "+91 98765 43210", totalFee: 120000, paidFee: 120000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", courseId: courseMap.get("UPSC 2026-A")?.id },
    { name: "Deepa Nair", email: "deepa@aim.edu", course: "SSC CGL Fast Track", batch: "Evening", joinDate: "Mar 2025", feeStatus: "Paid", attendance: "96%", phone: "+91 87654 32109", totalFee: 45000, paidFee: 45000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", courseId: courseMap.get("SSC CGL Fast Track")?.id },
    { name: "Rahul Kumar", email: "rahul@aim.edu", course: "Banking IBPS", batch: "Morning", joinDate: "Jun 2025", feeStatus: "Overdue", attendance: "72%", phone: "+91 76543 21098", totalFee: 40000, paidFee: 10000, nextInstallmentLabel: "Installment 2", nextInstallmentAmount: 15000, nextDueDate: "2026-04-20", courseId: courseMap.get("Banking IBPS")?.id },
    { name: "Priya Sharma", email: "priya@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Part Paid", attendance: "80%", phone: "+91 65432 10987", totalFee: 120000, paidFee: 70000, nextInstallmentLabel: "Installment 3", nextInstallmentAmount: 25000, nextDueDate: "2026-04-24", courseId: courseMap.get("UPSC 2026-A")?.id },
    { name: "Vikram Singh", email: "vikram@aim.edu", course: "MPPSC Evening", batch: "Evening", joinDate: "Sep 2025", feeStatus: "Paid", attendance: "92%", phone: "+91 54321 09876", totalFee: 75000, paidFee: 75000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", courseId: courseMap.get("MPPSC Evening")?.id },
    { name: "Ananya Joshi", email: "ananya@aim.edu", course: "SSC CGL Fast Track", batch: "Morning", joinDate: "Feb 2025", feeStatus: "Overdue", attendance: "60%", phone: "+91 43210 98765", totalFee: 45000, paidFee: 0, nextInstallmentLabel: "Installment 1", nextInstallmentAmount: 15000, nextDueDate: "2026-04-18", courseId: courseMap.get("SSC CGL Fast Track")?.id },
    { name: "Kunal Thakur", email: "kunal@aim.edu", course: "MPPSC Evening", batch: "Weekend", joinDate: "Nov 2025", feeStatus: "Paid", attendance: "85%", phone: "+91 32109 87654", totalFee: 75000, paidFee: 75000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", courseId: courseMap.get("MPPSC Evening")?.id },
    { name: "Meghna Rao", email: "meghna@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Part Paid", attendance: "78%", phone: "+91 21098 76543", totalFee: 120000, paidFee: 80000, nextInstallmentLabel: "Installment 3", nextInstallmentAmount: 20000, nextDueDate: "2026-04-27", courseId: courseMap.get("UPSC 2026-A")?.id },
  ];
  for (const data of studentSeeds) {
    const exists = await prisma.adminStudent.findUnique({ where: { email: data.email } });
    if (!exists) {
      await prisma.adminStudent.create({ data });
    }
  }
  for (const course of await prisma.adminCourse.findMany()) {
    await syncCourseStudentCount(course.title);
  }

  const announcementSeeds = [
    { title: "Weekend Mock Test Schedule", target: "Students Only", content: "Sunday mock tests will begin at 9:00 AM sharp for all active batches.", type: "Academic", isPinned: true },
    { title: "Fee Counter Update", target: "All Users", content: "Fee counter will remain open until 6:30 PM this week for installment support.", type: "Financial", isPinned: false },
  ];
  for (const data of announcementSeeds) {
    const exists = await prisma.announcement.findFirst({ where: { title: data.title } });
    if (!exists) {
      await prisma.announcement.create({ data });
    }
  }

  const staffSeeds = [
    { name: "Dr. Sandeep Kumar", role: "UPSC Senior Mentor", salary: 120000, payrollStatus: "Paid", payrollDate: "2026-04-10", attendanceStatus: "Present", clockIn: "08:45 AM", clockOut: "05:30 PM" },
    { name: "Meera Nair", role: "Content Head", salary: 85000, payrollStatus: "Pending", payrollDate: "2026-04-24", attendanceStatus: "Present", clockIn: "09:00 AM", clockOut: "06:00 PM" },
    { name: "Rajesh Varma", role: "Operations Manager", salary: 65000, payrollStatus: "Paid", payrollDate: "2026-04-15", attendanceStatus: "On Leave", clockIn: "-", clockOut: "-" },
    { name: "Aditi Singh", role: "Junior Faculty", salary: 45000, payrollStatus: "Processing", payrollDate: "2026-04-25", attendanceStatus: "Late", clockIn: "09:22 AM", clockOut: "Ongoing" },
    { name: "Vishal Dev", role: "Security", salary: 30000, payrollStatus: "Paid", payrollDate: "2026-04-05", attendanceStatus: "Present", clockIn: "06:00 AM", clockOut: "02:00 PM" },
  ];
  for (const data of staffSeeds) {
    const exists = await prisma.adminStaff.findFirst({ where: { name: data.name, role: data.role } });
    if (!exists) {
      await prisma.adminStaff.create({ data });
    }
  }

  const noteSeeds = [
    {
      title: "Indian Polity Notes (Laxmikanth Summary)",
      description: "Concise polity notes covering core constitutional chapters for revision.",
      category: "Polity",
      fileUrl: "/placeholder.svg",
      viewUrl: "/placeholder.svg",
      thumbnailUrl: "/placeholder.svg",
      displayOrder: 1,
      isVisible: true,
    },
    {
      title: "Modern Indian History - Complete Notes",
      description: "Chronological modern history notes with quick facts and revision blocks.",
      category: "History",
      fileUrl: "/placeholder.svg",
      viewUrl: "/placeholder.svg",
      thumbnailUrl: "/placeholder.svg",
      displayOrder: 2,
      isVisible: true,
    },
    {
      title: "Geography NCERT Compilation",
      description: "Physical and Indian geography summaries compiled from standard NCERT sources.",
      category: "Geography",
      fileUrl: "/placeholder.svg",
      viewUrl: "/placeholder.svg",
      thumbnailUrl: "/placeholder.svg",
      displayOrder: 3,
      isVisible: true,
    },
  ];
  for (const data of noteSeeds) {
    const exists = await prisma.adminNote.findFirst({ where: { title: data.title } });
    if (!exists) {
      await prisma.adminNote.create({ data });
    }
  }

  const videoSeeds = [
    {
      title: "UPSC Strategy Session",
      description: "Preparation roadmap, target-setting, and revision discipline from AIM mentors.",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: getYouTubeThumbnail("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      isVisible: true,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      title: "Student Success Story",
      description: "How disciplined practice and mentorship helped secure selection.",
      youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      thumbnailUrl: getYouTubeThumbnail("https://www.youtube.com/watch?v=ysz5S6PUM-U"),
      isVisible: true,
      isFeatured: true,
      displayOrder: 2,
    },
    {
      title: "Current Affairs Approach",
      description: "Faculty-led method for daily newspaper analysis and note-making.",
      youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      thumbnailUrl: getYouTubeThumbnail("https://www.youtube.com/watch?v=jNQXAC9IVRw"),
      isVisible: true,
      isFeatured: false,
      displayOrder: 3,
    },
    {
      title: "Mock Test Review Tips",
      description: "Use test analysis to improve scores faster and identify weak areas.",
      youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      thumbnailUrl: getYouTubeThumbnail("https://www.youtube.com/watch?v=aqz-KE-bpKQ"),
      isVisible: true,
      isFeatured: false,
      displayOrder: 4,
    },
  ];
  for (const data of videoSeeds) {
    const exists = await prisma.adminVideo.findFirst({ where: { youtubeUrl: data.youtubeUrl } });
    if (!exists) {
      await prisma.adminVideo.create({ data });
    }
  }

  const existingSettings = await prisma.websiteSettings.count();
  if (existingSettings === 0) {
    await prisma.websiteSettings.create({
      data: {
        bannerText: "New Batch Admissions Open for MP PSC & UPSC Foundation 2026-27 | AIM Academy: Synonym of Success | Call: +91 70672 31189",
        slidesJson: JSON.stringify([
          "/images/HEROMAIN 007.jpeg",
          "/images/STUDENT BANNER 01.jpeg",
          "/images/STUDENT_BANNER.jpeg",
        ]),
        facultyJson: JSON.stringify([
          { name: "Rahul Sir", sub: "History Strategy Expert", img: "/images/faculty_1.png" },
          { name: "Priya Ma'am", sub: "Science Specialist", img: "/images/faculty_2.png" },
          { name: "Amit Sir", sub: "Maths Wizard", img: "/images/faculty_3.png" },
          { name: "Vikas Sir", sub: "Geography Mentor", img: "/images/faculty_4.png" },
          { name: "Neha Ma'am", sub: "Current Affairs Analysis", img: "/images/faculty_5.png" },
        ]),
      },
    });
  }
    })().catch((err) => {
      adminSeedPromise = null;
      throw err;
    });
  }

  await adminSeedPromise;
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
  } catch (error) {
    handleError(res, error, "Failed to load admin data");
  }
};

export const getPublicContent = async (_req: Request, res: Response) => {
  try {
    await seedAdminData();
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
          }
        : null,
    });
  } catch (error) {
    handleError(res, error, "Failed to load public content");
  }
};

export const getAdminStudents = async (_req: Request, res: Response) => {
  try {
    await seedAdminData();
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
    if (existingEmail) {
      return res.status(409).json({ error: "A student with this email already exists" });
    }

    const existingPhone = await prisma.adminStudent.findUnique({ where: { phone: payload.phone } });
    if (existingPhone) {
      return res.status(409).json({ error: "A student with this phone number already exists" });
    }

    const course = await prisma.adminCourse.findUnique({ where: { title: payload.course } });
    if (!course) {
      return res.status(404).json({ error: "Selected course was not found" });
    }

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
    const existing = await prisma.adminStudent.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Student not found" });
    }

    const payload = studentSchema.partial().parse(req.body);

    if (payload.email && payload.email !== existing.email) {
      const duplicate = await prisma.adminStudent.findUnique({ where: { email: payload.email } });
      if (duplicate) return res.status(409).json({ error: "A student with this email already exists" });
    }

    if (payload.phone && payload.phone !== existing.phone) {
      const duplicate = await prisma.adminStudent.findUnique({ where: { phone: payload.phone } });
      if (duplicate) return res.status(409).json({ error: "A student with this phone number already exists" });
    }

    let courseId = existing.courseId;
    const nextCourseTitle = payload.course ?? existing.course;
    const course = await prisma.adminCourse.findUnique({ where: { title: nextCourseTitle } });
    if (!course) {
      return res.status(404).json({ error: "Selected course was not found" });
    }
    courseId = course.id;

    const totalFee = payload.totalFee ?? existing.totalFee;
    const paidFee = payload.paidFee ?? existing.paidFee;

    const student = await prisma.adminStudent.update({
      where: { id },
      data: {
        ...payload,
        courseId,
        totalFee,
        paidFee,
        feeStatus: payload.feeStatus ?? calculateFeeStatus(paidFee, totalFee),
      },
    });

    await Promise.all([syncCourseStudentCount(existing.course), syncCourseStudentCount(nextCourseTitle)]);
    res.json(student);
  } catch (error) {
    handleError(res, error, "Failed to update student");
  }
};

export const deleteAdminStudent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.adminStudent.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Student not found" });
    }

    await prisma.adminStudent.delete({ where: { id } });
    await syncCourseStudentCount(existing.course);
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Failed to delete student");
  }
};

export const getAdminCourses = async (_req: Request, res: Response) => {
  try {
    await seedAdminData();
    const courses = await prisma.adminCourse.findMany({ orderBy: { createdAt: "asc" } });
    res.json(courses);
  } catch (error) {
    handleError(res, error, "Failed to fetch courses");
  }
};

export const addAdminCourse = async (req: Request, res: Response) => {
  try {
    const payload = courseSchema.parse(req.body);
    const existing = await prisma.adminCourse.findUnique({ where: { title: payload.title } });
    if (existing) {
      return res.status(409).json({ error: "A course with this title already exists" });
    }

    const course = await prisma.adminCourse.create({
      data: {
        ...payload,
        students: payload.students ?? 0,
        status: payload.status ?? "Active",
      },
    });

    res.status(201).json(course);
  } catch (error) {
    handleError(res, error, "Failed to add course");
  }
};

export const updateAdminCourse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.adminCourse.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Course not found" });
    }

    const payload = courseSchema.partial().parse(req.body);
    if (payload.title && payload.title !== existing.title) {
      const duplicate = await prisma.adminCourse.findUnique({ where: { title: payload.title } });
      if (duplicate) return res.status(409).json({ error: "A course with this title already exists" });
    }

    const nextTitle = payload.title ?? existing.title;
    const course = await prisma.adminCourse.update({
      where: { id },
      data: payload,
    });

    if (nextTitle !== existing.title) {
      await prisma.adminStudent.updateMany({
        where: { course: existing.title },
        data: { course: nextTitle },
      });
      await syncCourseStudentCount(nextTitle);
      await syncCourseStudentCount(existing.title);
    }

    res.json(course);
  } catch (error) {
    handleError(res, error, "Failed to update course");
  }
};

export const deleteAdminCourse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const course = await prisma.adminCourse.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const linkedStudents = await prisma.adminStudent.count({ where: { courseId: id } });
    if (linkedStudents > 0) {
      return res.status(409).json({ error: "Reassign or delete students before archiving this course" });
    }

    await prisma.adminCourse.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Failed to delete course");
  }
};

export const getAnnouncements = async (_req: Request, res: Response) => {
  try {
    await seedAdminData();
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });
    res.json(announcements);
  } catch (error) {
    handleError(res, error, "Failed to fetch announcements");
  }
};

export const addAnnouncement = async (req: Request, res: Response) => {
  try {
    const payload = announcementSchema.parse(req.body);
    const announcement = await prisma.announcement.create({
      data: {
        ...payload,
        isPinned: payload.isPinned ?? false,
      },
    });
    res.status(201).json(announcement);
  } catch (error) {
    handleError(res, error, "Failed to add announcement");
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const payload = announcementSchema.partial().parse(req.body);
    const announcement = await prisma.announcement.update({
      where: { id },
      data: payload,
    });
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
    await seedAdminData();
    const staff = await prisma.adminStaff.findMany({ orderBy: { createdAt: "asc" } });
    res.json(staff);
  } catch (error) {
    handleError(res, error, "Failed to fetch staff records");
  }
};

export const processPayroll = async (_req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    await prisma.adminStaff.updateMany({
      where: { payrollStatus: { not: "Paid" } },
      data: { payrollStatus: "Paid", payrollDate: today },
    });
    const staff = await prisma.adminStaff.findMany({ orderBy: { createdAt: "asc" } });
    res.json(staff);
  } catch (error) {
    handleError(res, error, "Failed to process payroll");
  }
};

export const markAttendance = async (_req: Request, res: Response) => {
  try {
    const students = await prisma.adminStudent.findMany();
    const updated = await Promise.all(
      students.map((student, index) => {
        const nextRate = Math.min(100, Math.max(55, parseInt(student.attendance, 10) + (index % 3 === 0 ? 1 : 0)));
        return prisma.adminStudent.update({
          where: { id: student.id },
          data: { attendance: `${nextRate}%` },
        });
      }),
    );

    const staff = await prisma.adminStaff.findMany();
    await Promise.all(
      staff.map((member) =>
        prisma.adminStaff.update({
          where: { id: member.id },
          data: {
            attendanceStatus: member.attendanceStatus === "On Leave" ? "Present" : member.attendanceStatus,
            clockIn: member.clockIn === "-" ? "09:00 AM" : member.clockIn,
            clockOut: member.clockOut === "-" ? "06:00 PM" : member.clockOut,
          },
        }),
      ),
    );

    res.json(updated);
  } catch (error) {
    handleError(res, error, "Failed to mark attendance");
  }
};

export const sendFeeReminders = async (req: Request, res: Response) => {
  try {
    const ids = z.array(z.number().int().positive()).min(1).parse(req.body.studentIds);
    const now = new Date();
    const students = await Promise.all(
      ids.map((id) =>
        prisma.adminStudent.update({
          where: { id },
          data: {
            remindersSent: { increment: 1 },
            lastReminderAt: now,
          },
        }),
      ),
    );
    res.json(students);
  } catch (error) {
    handleError(res, error, "Failed to send fee reminders");
  }
};

export const getWebsiteSettings = async (_req: Request, res: Response) => {
  try {
    await seedAdminData();
    const settings = await prisma.websiteSettings.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!settings) {
      return res.status(404).json({ error: "Website settings not found" });
    }

    res.json({
      id: settings.id,
      bannerText: settings.bannerText,
      slides: JSON.parse(settings.slidesJson),
      faculty: JSON.parse(settings.facultyJson),
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch website settings");
  }
};

export const updateWebsiteSettings = async (req: Request, res: Response) => {
  try {
    const payload = websiteSettingsSchema.parse(req.body);
    const settings = await prisma.websiteSettings.findFirst({ orderBy: { updatedAt: "desc" } });
    const data = {
      bannerText: payload.bannerText,
      slidesJson: JSON.stringify(payload.slides),
      facultyJson: JSON.stringify(payload.faculty),
    };

    const updated = settings
      ? await prisma.websiteSettings.update({ where: { id: settings.id }, data })
      : await prisma.websiteSettings.create({ data });

    res.json({
      id: updated.id,
      bannerText: updated.bannerText,
      slides: JSON.parse(updated.slidesJson),
      faculty: JSON.parse(updated.facultyJson),
    });
  } catch (error) {
    handleError(res, error, "Failed to update website settings");
  }
};

export const getAdminNotes = async (_req: Request, res: Response) => {
  try {
    await seedAdminData();
    const notes = await prisma.adminNote.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
    res.json(notes);
  } catch (error) {
    handleError(res, error, "Failed to fetch notes");
  }
};

export const addAdminNote = async (req: Request, res: Response) => {
  try {
    const payload = noteSchema.parse(req.body);
    const note = await prisma.adminNote.create({
      data: {
        ...payload,
        isVisible: payload.isVisible ?? true,
        displayOrder: payload.displayOrder ?? 0,
      },
    });
    res.status(201).json(note);
  } catch (error) {
    handleError(res, error, "Failed to add note");
  }
};

export const updateAdminNote = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = noteSchema.partial().parse(req.body);
    const note = await prisma.adminNote.update({
      where: { id },
      data: payload,
    });
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
    await seedAdminData();
    const videos = await prisma.adminVideo.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
    res.json(videos);
  } catch (error) {
    handleError(res, error, "Failed to fetch videos");
  }
};

export const addAdminVideo = async (req: Request, res: Response) => {
  try {
    const payload = videoSchema.parse(req.body);
    const existing = await prisma.adminVideo.findFirst({ where: { youtubeUrl: payload.youtubeUrl } });
    if (existing) {
      return res.status(409).json({ error: "This YouTube video already exists" });
    }

    const video = await prisma.adminVideo.create({
      data: {
        ...payload,
        thumbnailUrl: payload.thumbnailUrl || getYouTubeThumbnail(payload.youtubeUrl),
        isVisible: payload.isVisible ?? true,
        isFeatured: payload.isFeatured ?? false,
        displayOrder: payload.displayOrder ?? 0,
      },
    });
    res.status(201).json(video);
  } catch (error) {
    handleError(res, error, "Failed to add video");
  }
};

export const updateAdminVideo = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = videoSchema.partial().parse(req.body);
    if (payload.youtubeUrl) {
      const duplicate = await prisma.adminVideo.findFirst({
        where: { youtubeUrl: payload.youtubeUrl, id: { not: id } },
      });
      if (duplicate) {
        return res.status(409).json({ error: "This YouTube video already exists" });
      }
    }

    const video = await prisma.adminVideo.update({
      where: { id },
      data: {
        ...payload,
        thumbnailUrl: payload.thumbnailUrl || (payload.youtubeUrl ? getYouTubeThumbnail(payload.youtubeUrl) : undefined),
      },
    });
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
