const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const settings = await prisma.websiteSettings.findFirst();
  const f = JSON.parse(settings.facultyJson);
  f.forEach(x => console.log(x.name, x.img));
  await prisma.$disconnect();
}
check();
