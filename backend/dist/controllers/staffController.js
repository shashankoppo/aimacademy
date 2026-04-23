"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAcademicAudit = exports.downloadFinancialReport = exports.updateStaffAttendance = exports.broadcastAlert = exports.getStaffDashboard = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
function createSimplePdf(text) {
    const sanitized = text.replace(/\r/g, "");
    const lines = sanitized.split("\n").slice(0, 200);
    const content = [
        "BT",
        "/F1 12 Tf",
        "72 760 Td",
        ...lines.flatMap((line, idx) => {
            const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
            const y = idx === 0 ? "" : "0 -16 Td";
            return [y, `(${escaped}) Tj`].filter(Boolean);
        }),
        "ET",
    ].join("\n");
    const objects = [];
    objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
    objects.push("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n");
    objects.push("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
    objects.push(`5 0 obj\n<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream\nendobj\n`);
    let offset = 0;
    const header = "%PDF-1.4\n";
    offset += Buffer.byteLength(header, "utf8");
    const xref = [0];
    for (const obj of objects) {
        xref.push(offset);
        offset += Buffer.byteLength(obj, "utf8");
    }
    const xrefStart = offset;
    const xrefLines = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
    for (let i = 1; i <= objects.length; i++) {
        xrefLines.push(`${String(xref[i]).padStart(10, "0")} 00000 n `);
    }
    const xrefBlock = `${xrefLines.join("\n")}\n`;
    offset += Buffer.byteLength(xrefBlock, "utf8");
    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
    return Buffer.from(header + objects.join("") + xrefBlock + trailer, "utf8");
}
const getStaffDashboard = async (_req, res) => {
    const staff = await prisma_1.prisma.adminStaff.findMany({ orderBy: { id: "asc" } });
    const present = staff.filter((s) => s.attendanceStatus === "Present").length;
    const total = staff.length;
    const revenue = await prisma_1.prisma.adminStudent.aggregate({ _sum: { paidFee: true } });
    const newAdmissions = await prisma_1.prisma.adminStudent.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    });
    res.json({
        success: true,
        stats: {
            staffPresent: `${present}/${total || 0}`,
            todaysCollection: revenue._sum.paidFee ?? 0,
            newAdmissions,
            pendingTasks: 8,
        },
        staff,
        tasks: [
            "Coordinate MP PSC Batch-A Mock Test",
            "Update Vyapam Course Material Slips",
            "Finalize SI Physical Training Schedule",
            "Verify SAMVIDA 3rd Hall Tickets",
        ],
        events: [
            { day: "05", mon: "APR", event: "Staff Townhall Session" },
            { day: "12", mon: "APR", event: "Q1 Performance Review" },
            { day: "18", mon: "APR", event: "Campus Maintenance Day" },
        ],
    });
};
exports.getStaffDashboard = getStaffDashboard;
const broadcastSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2),
    content: zod_1.z.string().trim().min(5),
    target: zod_1.z.string().trim().min(2).default("All Users"),
    type: zod_1.z.string().trim().min(2).default("Operational"),
    isPinned: zod_1.z.boolean().optional(),
});
const broadcastAlert = async (req, res) => {
    const payload = broadcastSchema.parse(req.body);
    const announcement = await prisma_1.prisma.announcement.create({
        data: {
            title: payload.title,
            content: payload.content,
            target: payload.target,
            type: payload.type,
            isPinned: payload.isPinned ?? false,
        },
    });
    res.status(201).json({ success: true, announcement });
};
exports.broadcastAlert = broadcastAlert;
const attendanceSchema = zod_1.z.object({
    staffId: zod_1.z.coerce.number().int().positive(),
    attendanceStatus: zod_1.z.enum(["Present", "Late", "On Leave"]).optional(),
    clockIn: zod_1.z.string().trim().optional(),
    clockOut: zod_1.z.string().trim().optional(),
});
const updateStaffAttendance = async (req, res) => {
    const payload = attendanceSchema.parse(req.body);
    const updated = await prisma_1.prisma.adminStaff.update({
        where: { id: payload.staffId },
        data: {
            attendanceStatus: payload.attendanceStatus ?? undefined,
            clockIn: payload.clockIn ?? undefined,
            clockOut: payload.clockOut ?? undefined,
        },
    });
    res.json({ success: true, staff: updated });
};
exports.updateStaffAttendance = updateStaffAttendance;
const downloadFinancialReport = async (_req, res) => {
    const students = await prisma_1.prisma.adminStudent.findMany();
    const courses = await prisma_1.prisma.adminCourse.findMany();
    const revenue = students.reduce((sum, s) => sum + (s.paidFee ?? 0), 0);
    const overdue = students.filter((s) => s.feeStatus === "Overdue").length;
    const report = [
        "AIM Academy Financial Report",
        `Generated: ${new Date().toLocaleString("en-IN")}`,
        "",
        `Students: ${students.length}`,
        `Courses: ${courses.length}`,
        `Revenue Collected: INR ${revenue.toLocaleString("en-IN")}`,
        `Overdue Students: ${overdue}`,
    ].join("\n");
    const pdf = createSimplePdf(report);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="financial-report.pdf"');
    res.send(pdf);
};
exports.downloadFinancialReport = downloadFinancialReport;
const downloadAcademicAudit = async (_req, res) => {
    const students = await prisma_1.prisma.adminStudent.findMany();
    const tests = await prisma_1.prisma.mockTest.count({ where: { isPublished: true } });
    const report = [
        "AIM Academy Academic Audit",
        `Generated: ${new Date().toLocaleString("en-IN")}`,
        "",
        `Students: ${students.length}`,
        `Published Mock Tests: ${tests}`,
        "",
        "Note: This audit is generated from portal activity logs.",
    ].join("\n");
    const pdf = createSimplePdf(report);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="academic-audit.pdf"');
    res.send(pdf);
};
exports.downloadAcademicAudit = downloadAcademicAudit;
