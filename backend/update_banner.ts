import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const newBannerText = "🎉 Happy Birthday to our Founder, Mr. Imran Khan! 🎂 | 🚀 AIM Academy is officially launching today! Admissions Open | Call: +91 70672 31189";
  
  const existingSettings = await prisma.websiteSettings.findFirst();
  if (existingSettings) {
    await prisma.websiteSettings.update({
      where: { id: existingSettings.id },
      data: { bannerText: newBannerText }
    });
    console.log("Updated existing banner text.");
  } else {
    console.log("No website settings found. It will be seeded automatically on startup.");
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
