import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./src/security/password";

const prisma = new PrismaClient();

async function main() {
  const password = await hashPassword("password123");

  const users = [
    { email: "teacher@aim.com", name: "Test Teacher", role: "TEACHER" },
    { email: "staff@aim.com", name: "Test Staff", role: "STAFF" },
    { email: "student@aim.com", name: "Test Student", role: "STUDENT" },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          role: u.role,
          password: password,
        },
      });
      console.log(`Created ${u.role}: ${u.email} / password123`);
    } else {
      console.log(`${u.role} already exists: ${u.email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
