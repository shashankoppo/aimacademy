import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import iamRoutes from "./routes/iamRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import studentRoutes from "./routes/studentRoutes";
import staffRoutes from "./routes/staffRoutes";
import { seedAdminData } from "./controllers/adminController";
import { ensureIamSeeded } from "./seed/iamSeed";
import { ensureDemoUsers } from "./seed/demoUsers";
import { ensurePortalSeeded } from "./seed/portalSeed";
import { attachRequestId } from "./middleware/audit";
import { authenticate, requirePermission } from "./middleware/auth";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Security and standard middlewares
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN ?? "http://localhost:8080,http://localhost:5173").split(",").map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(attachRequestId);

// Main App API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/admin/iam", authenticate, requirePermission("admin:access"), iamRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/staff", staffRoutes);

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'AIM Academy API is running securely.' });
});

Promise.resolve()
  .then(async () => {
    await ensureIamSeeded();
    await ensureDemoUsers();
    await seedAdminData();
    await ensurePortalSeeded();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] AIM Academy API is alive on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('[Server] Failed to initialize admin data:', error);
    process.exit(1);
  });
