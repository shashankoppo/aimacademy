"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const iamRoutes_1 = __importDefault(require("./routes/iamRoutes"));
const teacherRoutes_1 = __importDefault(require("./routes/teacherRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const staffRoutes_1 = __importDefault(require("./routes/staffRoutes"));
const adminController_1 = require("./controllers/adminController");
const iamSeed_1 = require("./seed/iamSeed");
const demoUsers_1 = require("./seed/demoUsers");
const portalSeed_1 = require("./seed/portalSeed");
const audit_1 = require("./middleware/audit");
const auth_1 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
app.set("trust proxy", 1);
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
}));
const customAllowedOrigins = (process.env.CORS_ORIGIN ?? "*").split(",").map((s) => s.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || customAllowedOrigins.includes("*") || customAllowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(null, true); // Permissive for production debugging
        }
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: "5mb" }));
app.use(audit_1.attachRequestId);
// Routes
app.use('/api/auth', authRoutes_1.default);
app.get("/api/public/content", adminController_1.getPublicContent);
app.use('/api/admin', adminRoutes_1.default);
app.use("/api/admin/iam", auth_1.authenticate, (0, auth_1.requirePermission)("admin:access"), iamRoutes_1.default);
app.use("/api/teacher", teacherRoutes_1.default);
app.use("/api/student", studentRoutes_1.default);
app.use("/api/staff", staffRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'AIM Academy API is active.' });
});
// Start listening IMMEDIATELY to satisfy healthchecks and Nginx
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] AIM Academy API listening on http://0.0.0.0:${PORT}`);
    // Perform seeding in the background to avoid blocking the listen event
    console.log(`[Server] Starting background data synchronization...`);
    Promise.resolve()
        .then(async () => {
        await (0, iamSeed_1.ensureIamSeeded)();
        await (0, demoUsers_1.ensureDemoUsers)();
        await (0, adminController_1.seedAdminData)();
        await (0, portalSeed_1.ensurePortalSeeded)();
        console.log(`[Server] Background synchronization completed successfully.`);
    })
        .catch((error) => {
        console.error('[Server] Background synchronization failed:', error);
        // We don't exit here because the server is already up. 
        // Admin will need to check logs.
    });
});
