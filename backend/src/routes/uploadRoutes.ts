import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { authenticate, requirePermission } from "../middleware/auth";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${ext}`;
    cb(null, uniqueFilename);
  }
});

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
]);

const DANGEROUS_EXTENSIONS = new Set([
  ".html", ".htm", ".xhtml", ".js", ".mjs", ".ts", ".jsx", ".tsx",
  ".exe", ".bat", ".cmd", ".sh", ".bash", ".php", ".py", ".rb", ".vbs",
  ".svg", ".dll", ".so", ".jar", ".war"
]);

const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (DANGEROUS_EXTENSIONS.has(ext)) {
      return cb(new Error(`File extension '${ext}' is not permitted for security reasons.`));
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      return cb(new Error(`File type '${file.mimetype}' is not permitted.`));
    }
    cb(null, true);
  }
});

router.post("/", authenticate, requirePermission("admin:access"), upload.single("file"), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    
    // Construct the URL to return to the frontend
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: "Failed to upload file" });
  }
});

export default router;
