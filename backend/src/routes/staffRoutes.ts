import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth";
import { broadcastAlert, getStaffDashboard, updateStaffAttendance, downloadFinancialReport, downloadAcademicAudit } from "../controllers/staffController";

const router = Router();

router.use(authenticate);
router.use(requirePermission("staff:access"));

router.get("/dashboard", getStaffDashboard);
router.post("/broadcast", requirePermission("staff:broadcast"), broadcastAlert);
router.post("/attendance/update", requirePermission("staff:manage_attendance"), updateStaffAttendance);

router.get("/reports/financial", requirePermission("staff:generate_reports"), downloadFinancialReport);
router.get("/reports/audit", requirePermission("staff:generate_reports"), downloadAcademicAudit);

export default router;

