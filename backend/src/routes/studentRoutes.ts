import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth";
import { getStudentDashboard, getStudentMockTestById, getStudentMockTestCurrent, listStudentResources, listStudentResults, submitStudentMockTest } from "../controllers/studentController";

const router = Router();

router.use(authenticate);
router.use(requirePermission("student:access"));

router.get("/dashboard", getStudentDashboard);

router.get("/mock-test/current", requirePermission("student:take_tests"), getStudentMockTestCurrent);
router.get("/mock-test/:id", requirePermission("student:take_tests"), getStudentMockTestById);
router.post("/mock-test/:id/submit", requirePermission("student:take_tests"), submitStudentMockTest);

router.get("/results", requirePermission("student:view_results"), listStudentResults);
router.get("/resources", requirePermission("student:view_resources"), listStudentResources);

export default router;
