"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const audit_1 = require("../middleware/audit");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), "uploads");
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
// Admin API: authenticated + authorized
router.use(auth_1.authenticate);
router.use((0, auth_1.requirePermission)("admin:access"));
router.use((req, res, next) => {
    const method = req.method;
    const path = req.path;
    res.on("finish", () => {
        if (method !== "GET" && res.statusCode < 400) {
            void (0, audit_1.auditLog)({ req, action: "admin.mutation", metadata: { method, path, status: res.statusCode } });
        }
    });
    next();
});
router.get('/overview', adminController_1.getAdminOverview);
router.post("/upload", upload.single("file"), adminController_1.handleFileUpload);
router.get("/students", (0, auth_1.requirePermission)("admin:manage_students"), adminController_1.getAdminStudents);
router.post("/students", (0, auth_1.requirePermission)("admin:manage_students"), adminController_1.addAdminStudent);
router.put("/students/:id", (0, auth_1.requirePermission)("admin:manage_students"), adminController_1.updateAdminStudent);
router.delete("/students/:id", (0, auth_1.requirePermission)("admin:manage_students"), adminController_1.deleteAdminStudent);
router.get("/courses", (0, auth_1.requirePermission)("admin:manage_courses"), adminController_1.getAdminCourses);
router.post("/courses", (0, auth_1.requirePermission)("admin:manage_courses"), adminController_1.addAdminCourse);
router.put("/courses/:id", (0, auth_1.requirePermission)("admin:manage_courses"), adminController_1.updateAdminCourse);
router.delete("/courses/:id", (0, auth_1.requirePermission)("admin:manage_courses"), adminController_1.deleteAdminCourse);
router.get("/announcements", (0, auth_1.requirePermission)("admin:manage_announcements"), adminController_1.getAnnouncements);
router.post("/announcements", (0, auth_1.requirePermission)("admin:manage_announcements"), adminController_1.addAnnouncement);
router.put("/announcements/:id", (0, auth_1.requirePermission)("admin:manage_announcements"), adminController_1.updateAnnouncement);
router.delete("/announcements/:id", (0, auth_1.requirePermission)("admin:manage_announcements"), adminController_1.deleteAnnouncement);
router.get("/staff", (0, auth_1.requirePermission)("admin:manage_payroll"), adminController_1.getAdminStaff);
router.put("/staff/:id", (0, auth_1.requirePermission)("admin:manage_payroll"), adminController_1.updateAdminStaff);
router.post("/payroll/process", (0, auth_1.requirePermission)("admin:manage_payroll"), adminController_1.processPayroll);
router.post("/attendance/mark-today", (0, auth_1.requirePermission)("admin:manage_attendance"), adminController_1.markAttendance);
router.post("/fee-reminders/send", (0, auth_1.requirePermission)("admin:manage_fees"), adminController_1.sendFeeReminders);
router.get("/website-settings", (0, auth_1.requirePermission)("admin:manage_website_settings"), adminController_1.getWebsiteSettings);
router.put("/website-settings", (0, auth_1.requirePermission)("admin:manage_website_settings"), adminController_1.updateWebsiteSettings);
router.get("/notes", (0, auth_1.requirePermission)("admin:manage_notes"), adminController_1.getAdminNotes);
router.post("/notes", (0, auth_1.requirePermission)("admin:manage_notes"), adminController_1.addAdminNote);
router.put("/notes/:id", (0, auth_1.requirePermission)("admin:manage_notes"), adminController_1.updateAdminNote);
router.delete("/notes/:id", (0, auth_1.requirePermission)("admin:manage_notes"), adminController_1.deleteAdminNote);
router.get("/videos", (0, auth_1.requirePermission)("admin:manage_videos"), adminController_1.getAdminVideos);
router.post("/videos", (0, auth_1.requirePermission)("admin:manage_videos"), adminController_1.addAdminVideo);
router.put("/videos/:id", (0, auth_1.requirePermission)("admin:manage_videos"), adminController_1.updateAdminVideo);
router.delete("/videos/:id", (0, auth_1.requirePermission)("admin:manage_videos"), adminController_1.deleteAdminVideo);
const mockTestController_1 = require("../controllers/mockTestController");
router.get("/mock-tests", (0, auth_1.requirePermission)("teacher:manage_tests"), mockTestController_1.getMockTests);
router.post("/mock-tests", (0, auth_1.requirePermission)("teacher:manage_tests"), mockTestController_1.createMockTest);
router.put("/mock-tests/:id", (0, auth_1.requirePermission)("teacher:manage_tests"), mockTestController_1.updateMockTest);
router.delete("/mock-tests/:id", (0, auth_1.requirePermission)("teacher:manage_tests"), mockTestController_1.deleteMockTest);
const leadController_1 = require("../controllers/leadController");
router.get("/leads", auth_1.authenticate, leadController_1.getLeads);
router.put("/leads/:id", auth_1.authenticate, leadController_1.updateLeadStatus);
router.delete("/leads/:id", auth_1.authenticate, leadController_1.deleteLead);
exports.default = router;
