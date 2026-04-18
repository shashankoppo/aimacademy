import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth";
import { auditLog } from "../middleware/audit";
import {
  getAdminOverview,
  getAdminStudents,
  addAdminStudent,
  updateAdminStudent,
  deleteAdminStudent,
  getAdminCourses,
  addAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  getAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAdminStaff,
  processPayroll,
  markAttendance,
  sendFeeReminders,
  getWebsiteSettings,
  updateWebsiteSettings,
  getAdminNotes,
  addAdminNote,
  updateAdminNote,
  deleteAdminNote,
  getAdminVideos,
  addAdminVideo,
  updateAdminVideo,
  deleteAdminVideo,
} from '../controllers/adminController';

const router = Router();

// Admin API: authenticated + authorized
router.use(authenticate);
router.use(requirePermission("admin:access"));
router.use((req, res, next) => {
  const method = req.method;
  const path = req.path;
  res.on("finish", () => {
    if (method !== "GET" && res.statusCode < 400) {
      void auditLog({ req, action: "admin.mutation", metadata: { method, path, status: res.statusCode } });
    }
  });
  next();
});

router.get('/overview', getAdminOverview);

router.get("/students", requirePermission("admin:manage_students"), getAdminStudents);
router.post("/students", requirePermission("admin:manage_students"), addAdminStudent);
router.put("/students/:id", requirePermission("admin:manage_students"), updateAdminStudent);
router.delete("/students/:id", requirePermission("admin:manage_students"), deleteAdminStudent);

router.get("/courses", requirePermission("admin:manage_courses"), getAdminCourses);
router.post("/courses", requirePermission("admin:manage_courses"), addAdminCourse);
router.put("/courses/:id", requirePermission("admin:manage_courses"), updateAdminCourse);
router.delete("/courses/:id", requirePermission("admin:manage_courses"), deleteAdminCourse);

router.get("/announcements", requirePermission("admin:manage_announcements"), getAnnouncements);
router.post("/announcements", requirePermission("admin:manage_announcements"), addAnnouncement);
router.put("/announcements/:id", requirePermission("admin:manage_announcements"), updateAnnouncement);
router.delete("/announcements/:id", requirePermission("admin:manage_announcements"), deleteAnnouncement);

router.get("/staff", requirePermission("admin:manage_payroll"), getAdminStaff);
router.post("/payroll/process", requirePermission("admin:manage_payroll"), processPayroll);
router.post("/attendance/mark-today", requirePermission("admin:manage_attendance"), markAttendance);
router.post("/fee-reminders/send", requirePermission("admin:manage_fees"), sendFeeReminders);

router.get("/website-settings", requirePermission("admin:manage_website_settings"), getWebsiteSettings);
router.put("/website-settings", requirePermission("admin:manage_website_settings"), updateWebsiteSettings);

router.get("/notes", requirePermission("admin:manage_notes"), getAdminNotes);
router.post("/notes", requirePermission("admin:manage_notes"), addAdminNote);
router.put("/notes/:id", requirePermission("admin:manage_notes"), updateAdminNote);
router.delete("/notes/:id", requirePermission("admin:manage_notes"), deleteAdminNote);

router.get("/videos", requirePermission("admin:manage_videos"), getAdminVideos);
router.post("/videos", requirePermission("admin:manage_videos"), addAdminVideo);
router.put("/videos/:id", requirePermission("admin:manage_videos"), updateAdminVideo);
router.delete("/videos/:id", requirePermission("admin:manage_videos"), deleteAdminVideo);

export default router;
