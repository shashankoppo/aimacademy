const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const getYouTubeThumbnail = (youtubeUrl) => {
  const match = youtubeUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
};

function hashPassword(plain) {
  const N = 16384;
  const r = 8;
  const p = 1;
  const keyLen = 64;
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(plain, salt, keyLen, { N, r, p });
  const enc = (buf) => buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return ["scrypt", N, r, p, keyLen, enc(salt), enc(derivedKey)].join("$");
}

async function seedIam() {
  const permissions = [
    { key: "admin:access", description: "Access admin API and portal" },
    { key: "admin:manage_students", description: "Create/update/delete students" },
    { key: "admin:manage_courses", description: "Create/update/delete courses" },
    { key: "admin:manage_fees", description: "Manage fees, reminders, records" },
    { key: "admin:manage_attendance", description: "Manage attendance" },
    { key: "admin:manage_payroll", description: "Manage payroll and staff ops" },
    { key: "admin:manage_announcements", description: "Manage announcements" },
    { key: "admin:manage_website_settings", description: "Manage website settings" },
    { key: "admin:manage_notes", description: "Manage notes" },
    { key: "admin:manage_videos", description: "Manage videos" },
    { key: "pam:manage_users", description: "Privileged user/role administration" },
    { key: "pam:export_data", description: "Privileged exports" },
    { key: "teacher:access", description: "Access teacher portal" },
    { key: "student:access", description: "Access student portal" },
    { key: "staff:access", description: "Access staff portal" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description },
      create: perm,
    });
  }

  const roleDefs = [
    { key: "ADMIN", name: "Super Admin / Head Admin", isSystem: true, permissionKeys: permissions.map((p) => p.key) },
    { key: "TEACHER", name: "Teacher", isSystem: true, permissionKeys: ["teacher:access"] },
    { key: "STUDENT", name: "Student", isSystem: true, permissionKeys: ["student:access"] },
    { key: "STAFF", name: "Staff", isSystem: true, permissionKeys: ["staff:access"] },
  ];

  for (const role of roleDefs) {
    const r = await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name, isSystem: role.isSystem },
      create: { key: role.key, name: role.name, isSystem: role.isSystem },
    });
    const perms = await prisma.permission.findMany({ where: { key: { in: role.permissionKeys } } });
    for (const perm of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: r.id, permissionId: perm.id } },
        update: {},
        create: { roleId: r.id, permissionId: perm.id },
      });
    }
  }
}

async function main() {
  await prisma.refreshToken.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  await prisma.testResult.deleteMany();
  await prisma.test.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.feeRecord.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  await prisma.adminStudent.deleteMany();
  await prisma.adminCourse.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.adminStaff.deleteMany();
  await prisma.adminNote.deleteMany();
  await prisma.adminVideo.deleteMany();
  await prisma.websiteSettings.deleteMany();

  await seedIam();

  const roles = await prisma.role.findMany();
  const roleIdByKey = new Map(roles.map((r) => [r.key, r.id]));
  const ensureUserRole = async (user) => {
    const roleId = roleIdByKey.get(user.role);
    if (!roleId) return;
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId } },
      update: {},
      create: { userId: user.id, roleId },
    });
  };

  const canonicalCourses = await Promise.all([
    prisma.course.create({ data: { name: "UPSC Foundation Program", duration: "12 Months", feeAmount: 120000, status: "ACTIVE" } }),
    prisma.course.create({ data: { name: "SSC CGL Intensive", duration: "6 Months", feeAmount: 45000, status: "ACTIVE" } }),
    prisma.course.create({ data: { name: "Banking IBPS Mastery", duration: "5 Months", feeAmount: 40000, status: "ACTIVE" } }),
  ]);

  const canonicalBatches = await Promise.all([
    prisma.batch.create({ data: { name: "UPSC Morning Batch", courseId: canonicalCourses[0].id } }),
    prisma.batch.create({ data: { name: "SSC Evening Batch", courseId: canonicalCourses[1].id } }),
    prisma.batch.create({ data: { name: "Banking Weekend Batch", courseId: canonicalCourses[2].id } }),
  ]);

  const teacherUsers = await Promise.all([
    prisma.user.create({ data: { name: "Dr. Sandeep Kumar", email: "teacher@aim.edu", password: hashPassword("teacher123"), role: "TEACHER", phone: "+917067200001" } }),
    prisma.user.create({ data: { name: "Meera Nair", email: "meera@aim.edu", password: hashPassword("teacher123"), role: "TEACHER", phone: "+917067200002" } }),
    prisma.user.create({ data: { name: "Rahul Verma", email: "rahul.verma@aim.edu", password: hashPassword("teacher123"), role: "TEACHER", phone: "+917067200003" } }),
  ]);
  await Promise.all(teacherUsers.map(ensureUserRole));

  await Promise.all([
    prisma.teacherProfile.create({ data: { userId: teacherUsers[0].id, subjects: "Polity, Ethics", batches: { connect: [{ id: canonicalBatches[0].id }] } } }),
    prisma.teacherProfile.create({ data: { userId: teacherUsers[1].id, subjects: "Current Affairs, Essay", batches: { connect: [{ id: canonicalBatches[0].id }, { id: canonicalBatches[1].id }] } } }),
    prisma.teacherProfile.create({ data: { userId: teacherUsers[2].id, subjects: "Quantitative Aptitude, Reasoning", batches: { connect: [{ id: canonicalBatches[1].id }, { id: canonicalBatches[2].id }] } } }),
  ]);

  const studentUsers = await Promise.all([
    prisma.user.create({ data: { name: "Aarav Mehta", email: "student@aim.edu", password: hashPassword("student123"), role: "STUDENT", phone: "+919876543210" } }),
    prisma.user.create({ data: { name: "Deepa Nair", email: "deepa.portal@aim.edu", password: hashPassword("student123"), role: "STUDENT", phone: "+918765432109" } }),
    prisma.user.create({ data: { name: "Rahul Kumar", email: "rahul.portal@aim.edu", password: hashPassword("student123"), role: "STUDENT", phone: "+917654321098" } }),
  ]);
  await Promise.all(studentUsers.map(ensureUserRole));

  const studentProfiles = await Promise.all([
    prisma.studentProfile.create({ data: { userId: studentUsers[0].id, batchId: canonicalBatches[0].id } }),
    prisma.studentProfile.create({ data: { userId: studentUsers[1].id, batchId: canonicalBatches[1].id } }),
    prisma.studentProfile.create({ data: { userId: studentUsers[2].id, batchId: canonicalBatches[2].id } }),
  ]);

  await Promise.all([
    prisma.feeRecord.create({ data: { studentId: studentProfiles[0].id, totalAmount: 120000, paidAmount: 120000, dueDate: new Date("2026-04-20"), status: "PAID" } }),
    prisma.feeRecord.create({ data: { studentId: studentProfiles[1].id, totalAmount: 45000, paidAmount: 30000, dueDate: new Date("2026-04-24"), status: "PART_PAID" } }),
    prisma.feeRecord.create({ data: { studentId: studentProfiles[2].id, totalAmount: 40000, paidAmount: 10000, dueDate: new Date("2026-04-18"), status: "OVERDUE" } }),
  ]);

  await Promise.all([
    prisma.attendance.create({ data: { studentId: studentProfiles[0].id, date: new Date("2026-04-15"), status: true } }),
    prisma.attendance.create({ data: { studentId: studentProfiles[1].id, date: new Date("2026-04-15"), status: true } }),
    prisma.attendance.create({ data: { studentId: studentProfiles[2].id, date: new Date("2026-04-15"), status: false } }),
  ]);

  const adminCourses = await Promise.all([
    prisma.adminCourse.create({ data: { title: "UPSC 2026-A", students: 4, faculty: "Dr. Sandeep Kumar", status: "Active", duration: "12-18 Months", fee: formatCurrency(120000) } }),
    prisma.adminCourse.create({ data: { title: "SSC CGL Fast Track", students: 3, faculty: "Rahul Verma", status: "Active", duration: "6 Months", fee: formatCurrency(45000) } }),
    prisma.adminCourse.create({ data: { title: "Banking IBPS", students: 2, faculty: "Suresh Pillai", status: "Upcoming", duration: "4-6 Months", fee: formatCurrency(40000) } }),
    prisma.adminCourse.create({ data: { title: "MPPSC Evening", students: 3, faculty: "Meera Nair", status: "Active", duration: "6-12 Months", fee: formatCurrency(75000) } }),
    prisma.adminCourse.create({ data: { title: "Foundation GS Weekend", students: 2, faculty: "Aditi Singh", status: "Completed", duration: "3 Months", fee: formatCurrency(18000) } }),
  ]);

  const adminCourseMap = new Map(adminCourses.map((course) => [course.title, course.id]));

  await Promise.all([
    prisma.adminStudent.create({ data: { name: "Aarav Mehta", email: "aarav@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Paid", attendance: "88%", phone: "+91 98765 43210", totalFee: 120000, paidFee: 120000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", remindersSent: 1, courseId: adminCourseMap.get("UPSC 2026-A") } }),
    prisma.adminStudent.create({ data: { name: "Deepa Nair", email: "deepa@aim.edu", course: "SSC CGL Fast Track", batch: "Evening", joinDate: "Mar 2025", feeStatus: "Paid", attendance: "96%", phone: "+91 87654 32109", totalFee: 45000, paidFee: 45000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", remindersSent: 0, courseId: adminCourseMap.get("SSC CGL Fast Track") } }),
    prisma.adminStudent.create({ data: { name: "Rahul Kumar", email: "rahul@aim.edu", course: "Banking IBPS", batch: "Morning", joinDate: "Jun 2025", feeStatus: "Overdue", attendance: "72%", phone: "+91 76543 21098", totalFee: 40000, paidFee: 10000, nextInstallmentLabel: "Installment 2", nextInstallmentAmount: 15000, nextDueDate: "2026-04-20", remindersSent: 3, courseId: adminCourseMap.get("Banking IBPS") } }),
    prisma.adminStudent.create({ data: { name: "Priya Sharma", email: "priya@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Part Paid", attendance: "80%", phone: "+91 65432 10987", totalFee: 120000, paidFee: 70000, nextInstallmentLabel: "Installment 3", nextInstallmentAmount: 25000, nextDueDate: "2026-04-24", remindersSent: 2, courseId: adminCourseMap.get("UPSC 2026-A") } }),
    prisma.adminStudent.create({ data: { name: "Vikram Singh", email: "vikram@aim.edu", course: "MPPSC Evening", batch: "Evening", joinDate: "Sep 2025", feeStatus: "Paid", attendance: "92%", phone: "+91 54321 09876", totalFee: 75000, paidFee: 75000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", remindersSent: 0, courseId: adminCourseMap.get("MPPSC Evening") } }),
    prisma.adminStudent.create({ data: { name: "Ananya Joshi", email: "ananya@aim.edu", course: "SSC CGL Fast Track", batch: "Morning", joinDate: "Feb 2025", feeStatus: "Overdue", attendance: "60%", phone: "+91 43210 98765", totalFee: 45000, paidFee: 0, nextInstallmentLabel: "Installment 1", nextInstallmentAmount: 15000, nextDueDate: "2026-04-18", remindersSent: 4, courseId: adminCourseMap.get("SSC CGL Fast Track") } }),
    prisma.adminStudent.create({ data: { name: "Kunal Thakur", email: "kunal@aim.edu", course: "MPPSC Evening", batch: "Weekend", joinDate: "Nov 2025", feeStatus: "Paid", attendance: "85%", phone: "+91 32109 87654", totalFee: 75000, paidFee: 75000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", remindersSent: 0, courseId: adminCourseMap.get("MPPSC Evening") } }),
    prisma.adminStudent.create({ data: { name: "Meghna Rao", email: "meghna@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Part Paid", attendance: "78%", phone: "+91 21098 76543", totalFee: 120000, paidFee: 80000, nextInstallmentLabel: "Installment 3", nextInstallmentAmount: 20000, nextDueDate: "2026-04-27", remindersSent: 1, courseId: adminCourseMap.get("UPSC 2026-A") } }),
    prisma.adminStudent.create({ data: { name: "Sana Khan", email: "sana@aim.edu", course: "Foundation GS Weekend", batch: "Weekend", joinDate: "Dec 2025", feeStatus: "Paid", attendance: "91%", phone: "+91 99887 77665", totalFee: 18000, paidFee: 18000, nextInstallmentLabel: "Completed", nextInstallmentAmount: 0, nextDueDate: "-", remindersSent: 0, courseId: adminCourseMap.get("Foundation GS Weekend") } }),
    prisma.adminStudent.create({ data: { name: "Harsh Tiwari", email: "harsh@aim.edu", course: "SSC CGL Fast Track", batch: "Evening", joinDate: "Apr 2025", feeStatus: "Part Paid", attendance: "83%", phone: "+91 90909 80808", totalFee: 45000, paidFee: 25000, nextInstallmentLabel: "Installment 2", nextInstallmentAmount: 10000, nextDueDate: "2026-04-29", remindersSent: 1, courseId: adminCourseMap.get("SSC CGL Fast Track") } }),
  ]);

  await Promise.all([
    prisma.announcement.create({ data: { title: "Weekend Mock Test Schedule", target: "Students Only", content: "Sunday mock tests will begin at 9:00 AM sharp for all active batches.", type: "Academic", isPinned: true } }),
    prisma.announcement.create({ data: { title: "Fee Counter Update", target: "All Users", content: "Fee counter will remain open until 6:30 PM this week for installment support.", type: "Financial", isPinned: false } }),
    prisma.announcement.create({ data: { title: "Faculty Mentorship Window", target: "All Users", content: "One-on-one mentorship booking is open for UPSC and SSC students this Friday.", type: "General", isPinned: false } }),
  ]);

  await Promise.all([
    prisma.adminStaff.create({ data: { name: "Dr. Sandeep Kumar", role: "UPSC Senior Mentor", salary: 120000, payrollStatus: "Paid", payrollDate: "2026-04-10", attendanceStatus: "Present", clockIn: "08:45 AM", clockOut: "05:30 PM" } }),
    prisma.adminStaff.create({ data: { name: "Meera Nair", role: "Content Head", salary: 85000, payrollStatus: "Pending", payrollDate: "2026-04-24", attendanceStatus: "Present", clockIn: "09:00 AM", clockOut: "06:00 PM" } }),
    prisma.adminStaff.create({ data: { name: "Rajesh Varma", role: "Operations Manager", salary: 65000, payrollStatus: "Paid", payrollDate: "2026-04-15", attendanceStatus: "On Leave", clockIn: "-", clockOut: "-" } }),
    prisma.adminStaff.create({ data: { name: "Aditi Singh", role: "Junior Faculty", salary: 45000, payrollStatus: "Processing", payrollDate: "2026-04-25", attendanceStatus: "Late", clockIn: "09:22 AM", clockOut: "Ongoing" } }),
    prisma.adminStaff.create({ data: { name: "Vishal Dev", role: "Security", salary: 30000, payrollStatus: "Paid", payrollDate: "2026-04-05", attendanceStatus: "Present", clockIn: "06:00 AM", clockOut: "02:00 PM" } }),
    prisma.adminStaff.create({ data: { name: "Nikita Rao", role: "Student Counselor", salary: 42000, payrollStatus: "Pending", payrollDate: "2026-04-26", attendanceStatus: "Present", clockIn: "09:12 AM", clockOut: "06:10 PM" } }),
  ]);

  await Promise.all([
    prisma.adminNote.create({ data: { title: "Indian Polity Notes (Laxmikanth Summary)", description: "Concise polity notes covering core constitutional chapters for revision.", category: "Polity", fileUrl: "/placeholder.svg", viewUrl: "/placeholder.svg", thumbnailUrl: "/placeholder.svg", displayOrder: 1, isVisible: true } }),
    prisma.adminNote.create({ data: { title: "Modern Indian History - Complete Notes", description: "Chronological modern history notes with quick facts and revision blocks.", category: "History", fileUrl: "/placeholder.svg", viewUrl: "/placeholder.svg", thumbnailUrl: "/placeholder.svg", displayOrder: 2, isVisible: true } }),
    prisma.adminNote.create({ data: { title: "Geography NCERT Compilation", description: "Physical and Indian geography summaries compiled from standard NCERT sources.", category: "Geography", fileUrl: "/placeholder.svg", viewUrl: "/placeholder.svg", thumbnailUrl: "/placeholder.svg", displayOrder: 3, isVisible: true } }),
    prisma.adminNote.create({ data: { title: "Economy Quick Revision Notes", description: "Inflation, banking, and budget essentials in one compact revision deck.", category: "Economy", fileUrl: "/placeholder.svg", viewUrl: "/placeholder.svg", thumbnailUrl: "/placeholder.svg", displayOrder: 4, isVisible: true } }),
  ]);

  const videos = [
    { title: "UPSC Strategy Session", description: "Preparation roadmap, target-setting, and revision discipline from AIM mentors.", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", isVisible: true, isFeatured: true, displayOrder: 1 },
    { title: "Student Success Story", description: "How disciplined practice and mentorship helped secure selection.", youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U", isVisible: true, isFeatured: true, displayOrder: 2 },
    { title: "Current Affairs Approach", description: "Faculty-led method for daily newspaper analysis and note-making.", youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw", isVisible: true, isFeatured: false, displayOrder: 3 },
    { title: "Mock Test Review Tips", description: "Use test analysis to improve scores faster and identify weak areas.", youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", isVisible: true, isFeatured: false, displayOrder: 4 },
  ];

  await Promise.all(
    videos.map((video) =>
      prisma.adminVideo.create({
        data: {
          ...video,
          thumbnailUrl: getYouTubeThumbnail(video.youtubeUrl),
        },
      }),
    ),
  );

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

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
