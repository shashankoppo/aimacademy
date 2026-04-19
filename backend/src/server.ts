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
import { getPublicContent, seedAdminData } from "./controllers/adminController";
import { ensureIamSeeded } from "./seed/iamSeed";
import { ensureDemoUsers } from "./seed/demoUsers";
import { ensurePortalSeeded } from "./seed/portalSeed";
import { attachRequestId } from "./middleware/audit";
import { authenticate, requirePermission } from "./middleware/auth";

dotenv.config();

const app: Express = express();
const PORT = Number(process.env.PORT) || 5000;

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: false,
}));

const customAllowedOrigins = (process.env.CORS_ORIGIN ?? "*").split(",").map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || customAllowedOrigins.includes("*") || customAllowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for production debugging
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "5mb" }));
app.use(attachRequestId);

// Routes
app.use('/api/auth', authRoutes);
app.get("/api/public/content", getPublicContent);
app.use('/api/admin', adminRoutes);
app.use("/api/admin/iam", authenticate, requirePermission("admin:access"), iamRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/staff", staffRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'AIM Academy API is active.' });
});

// Start listening IMMEDIATELY to satisfy healthchecks and Nginx
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] AIM Academy API listening on http://0.0.0.0:${PORT}`);
    
    // Perform seeding in the background to avoid blocking the listen event
    console.log(`[Server] Starting background data synchronization...`);
    Promise.resolve()
      .then(async () => {
        await ensureIamSeeded();
        await ensureDemoUsers();
        await seedAdminData();
        await ensurePortalSeeded();
        console.log(`[Server] Background synchronization completed successfully.`);
      })
      .catch((error) => {
        console.error('[Server] Background synchronization failed:', error);
        // We don't exit here because the server is already up. 
        // Admin will need to check logs.
      });
});
