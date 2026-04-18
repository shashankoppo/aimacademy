import { prisma } from "../prisma";

const PERMISSIONS = [
  { key: "admin:access", description: "Access admin API and portal" },
  { key: "admin:manage_students", description: "Create/update/delete students" },
  { key: "admin:manage_courses", description: "Create/update/delete courses" },
  { key: "admin:manage_fees", description: "Manage fees, reminders, records" },
  { key: "admin:manage_attendance", description: "Manage attendance" },
  { key: "admin:manage_payroll", description: "Manage payroll and staff ops" },
  { key: "admin:manage_announcements", description: "Manage announcements" },
  { key: "admin:manage_website_settings", description: "Manage website settings" },
  { key: "admin:manage_notes", description: "Manage notes" },
  { key: "admin:manage_videos", description: "Manage videos" },
  { key: "pam:manage_users", description: "Privileged user/role administration" },
  { key: "pam:export_data", description: "Privileged exports" },
  { key: "teacher:access", description: "Access teacher portal" },
  { key: "teacher:assign_courses", description: "Assign courses/programs to students/batches" },
  { key: "teacher:manage_tests", description: "Create/update/delete mock tests" },
  { key: "teacher:view_analytics", description: "View student analytics and leaderboards" },
  { key: "teacher:manage_resources", description: "Create/publish resources" },
  { key: "teacher:publish_results", description: "Publish mock test results" },
  { key: "student:access", description: "Access student portal" },
  { key: "student:take_tests", description: "Take mock tests and submit attempts" },
  { key: "student:view_results", description: "View published results" },
  { key: "student:view_resources", description: "View published resources" },
  { key: "staff:access", description: "Access staff portal" },
  { key: "staff:broadcast", description: "Broadcast alerts/announcements" },
  { key: "staff:generate_reports", description: "Generate operational reports" },
  { key: "staff:manage_attendance", description: "Mark staff attendance/clock-in/out" },
] as const;

const ROLES: Array<{ key: string; name: string; isSystem: boolean; permissionKeys: string[] }> = [
  {
    key: "ADMIN",
    name: "Super Admin / Head Admin",
    isSystem: true,
    permissionKeys: PERMISSIONS.map((p) => p.key),
  },
  {
    key: "TEACHER",
    name: "Teacher",
    isSystem: true,
    permissionKeys: [
      "teacher:access",
      "teacher:assign_courses",
      "teacher:manage_tests",
      "teacher:view_analytics",
      "teacher:manage_resources",
      "teacher:publish_results",
    ],
  },
  {
    key: "STUDENT",
    name: "Student",
    isSystem: true,
    permissionKeys: ["student:access", "student:take_tests", "student:view_results", "student:view_resources"],
  },
  {
    key: "STAFF",
    name: "Staff",
    isSystem: true,
    permissionKeys: ["staff:access", "staff:broadcast", "staff:generate_reports", "staff:manage_attendance"],
  },
];

export async function ensureIamSeeded() {
  // Permissions
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: { description: p.description },
      create: { key: p.key, description: p.description },
    });
  }

  // Roles + bindings
  for (const role of ROLES) {
    const r = await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name, isSystem: role.isSystem },
      create: { key: role.key, name: role.name, isSystem: role.isSystem },
    });

    // Ensure role permissions match exactly the intended set for system roles.
    if (role.isSystem) {
      const perms = await prisma.permission.findMany({ where: { key: { in: role.permissionKeys } } });
      const desired = new Set(perms.map((p) => p.id));
      const existing = await prisma.rolePermission.findMany({ where: { roleId: r.id } });
      const existingSet = new Set(existing.map((rp) => rp.permissionId));

      for (const rp of existing) {
        if (!desired.has(rp.permissionId)) await prisma.rolePermission.delete({ where: { roleId_permissionId: { roleId: rp.roleId, permissionId: rp.permissionId } } });
      }
      for (const permId of desired) {
        if (!existingSet.has(permId)) await prisma.rolePermission.create({ data: { roleId: r.id, permissionId: permId } });
      }
    }
  }

  // Ensure each user has a matching UserRole entry for their primary role.
  const rolesByKey = await prisma.role.findMany();
  const roleIdByKey = new Map(rolesByKey.map((r) => [r.key, r.id] as const));
  const users = await prisma.user.findMany();
  for (const u of users) {
    const roleId = roleIdByKey.get(u.role);
    if (!roleId) continue;
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: u.id, roleId } },
      update: {},
      create: { userId: u.id, roleId },
    });
  }
}
