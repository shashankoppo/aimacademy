const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const settings = await prisma.websiteSettings.findFirst();
  if (settings) {
    if (!settings.upcomingBatchesJson) {
      await prisma.websiteSettings.update({
        where: { id: settings.id },
        data: {
          upcomingBatchesJson: JSON.stringify([
            { title: "Comprehensive Foundation Batch 2026", desc: "A definitive classroom batch covering complete General Studies from absolute basics to advanced level.", status: "ADMISSIONS OPEN", seatsLeft: 12, totalSeats: 100, img: "/images/hero_combo_top.jpeg" },
            { title: "SSC Intensive Target Program", desc: "Rigorous daily practice and mock test-driven preparation for secure selections across CGL and CHSL.", status: "LIMITED SEATS", seatsLeft: 5, totalSeats: 80, img: "/images/hero_combo_mid.png" },
            { title: "Free Career Counseling Seminar", desc: "Guidance directly from toppers and expert mentors to completely roadmap your preparation journey.", status: "NEXT SUNDAY", seatsLeft: 2, totalSeats: 100, isCustomSplit: true },
          ])
        }
      });
      console.log("Seeded upcoming batches into dev.db");
    } else {
      console.log("Already has upcoming batches");
    }
  } else {
    console.log("No settings found");
  }
}

fix()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
