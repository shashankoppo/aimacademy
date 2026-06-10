const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const settings = await prisma.websiteSettings.findFirst();
  if (settings) {
    let f = JSON.parse(settings.facultyJson);
    const sandeep = f.find(x => x.name.includes('Sandeep'));
    if (sandeep) {
      sandeep.img = '/images/faculty_5.png';
      await prisma.websiteSettings.update({
        where: { id: settings.id },
        data: { facultyJson: JSON.stringify(f) }
      });
      console.log('Fixed Sandeep Sir image in DB.');
    }
  }
  await prisma.$disconnect();
}
fix();
