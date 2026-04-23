"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_USERS = void 0;
exports.ensureDemoUsers = ensureDemoUsers;
const prisma_1 = require("../prisma");
const password_1 = require("../security/password");
exports.DEMO_USERS = [
    { email: "student@aim.edu", password: "student123", role: "STUDENT", name: "Aarav Mehta", phone: "+919876543210" },
    { email: "teacher@aim.edu", password: "teacher123", role: "TEACHER", name: "Dr. Sandeep Kumar", phone: "+919812345678" },
    { email: "staff@aim.edu", password: "staff123", role: "STAFF", name: "Rajesh Varma", phone: "+919999888877" },
    { email: "admin@aim.edu", password: "admin@2026", role: "ADMIN", name: "Administrator", phone: "+919700000000" },
];
let seeded = null;
async function ensureDemoUsers() {
    if (!seeded) {
        seeded = (async () => {
            for (const demoUser of exports.DEMO_USERS) {
                const existing = await prisma_1.prisma.user.findUnique({ where: { email: demoUser.email } });
                if (!existing) {
                    await prisma_1.prisma.user.create({
                        data: {
                            email: demoUser.email,
                            role: demoUser.role,
                            name: demoUser.name,
                            phone: demoUser.phone,
                            password: await (0, password_1.hashPassword)(demoUser.password),
                            isActive: true,
                        },
                    });
                    continue;
                }
                const isMainAdmin = existing.email?.toLowerCase() === "admin@aim.edu";
                const passwordToStore = isMainAdmin
                    ? await (0, password_1.hashPassword)(demoUser.password)
                    : (0, password_1.isHashedPassword)(existing.password)
                        ? existing.password
                        : await (0, password_1.hashPassword)(demoUser.password);
                await prisma_1.prisma.user.update({
                    where: { id: existing.id },
                    data: {
                        name: existing.name || demoUser.name,
                        role: demoUser.role,
                        phone: existing.phone ?? demoUser.phone,
                        password: passwordToStore,
                        isActive: true,
                    },
                });
            }
        })();
    }
    await seeded;
}
