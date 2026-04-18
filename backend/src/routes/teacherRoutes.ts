import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth";
import {
  assignCourseAccess,
  createMockTest,
  createResource,
  deleteMockTest,
  deleteResource,
  getTeacherAnalytics,
  getTeacherDashboard,
  listMockTests,
  listResources,
  listStudentsForTeacher,
  publishResults,
  updateMockTest,
  updateResource,
} from "../controllers/teacherController";

const router = Router();

router.use(authenticate);
router.use(requirePermission("teacher:access"));

router.get("/dashboard", getTeacherDashboard);
router.get("/students", requirePermission("teacher:assign_courses"), listStudentsForTeacher);
router.post("/assign", requirePermission("teacher:assign_courses"), assignCourseAccess);

router.get("/mock-tests", requirePermission("teacher:manage_tests"), listMockTests);
router.post("/mock-tests", requirePermission("teacher:manage_tests"), createMockTest);
router.put("/mock-tests/:id", requirePermission("teacher:manage_tests"), updateMockTest);
router.delete("/mock-tests/:id", requirePermission("teacher:manage_tests"), deleteMockTest);

router.post("/publish-results", requirePermission("teacher:publish_results"), publishResults);
router.get("/analytics", requirePermission("teacher:view_analytics"), getTeacherAnalytics);

router.get("/resources", requirePermission("teacher:manage_resources"), listResources);
router.post("/resources", requirePermission("teacher:manage_resources"), createResource);
router.put("/resources/:id", requirePermission("teacher:manage_resources"), updateResource);
router.delete("/resources/:id", requirePermission("teacher:manage_resources"), deleteResource);

export default router;

