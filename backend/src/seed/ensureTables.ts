import { prisma } from "../prisma";

export async function ensureDatabaseTables() {
  try {
    // 1. Ensure GalleryCategory table exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "GalleryCategory" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "coverUrl" TEXT,
        "description" TEXT,
        "displayOrder" INTEGER NOT NULL DEFAULT 0,
        "isVisible" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "GalleryCategory_name_key" ON "GalleryCategory"("name");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "GalleryCategory_slug_key" ON "GalleryCategory"("slug");`);

    // 2. Ensure GalleryItem table exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "GalleryItem" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "title" TEXT,
        "imageUrl" TEXT NOT NULL,
        "thumbnailUrl" TEXT,
        "categoryId" INTEGER NOT NULL,
        "isVisible" BOOLEAN NOT NULL DEFAULT 1,
        "isFeatured" BOOLEAN NOT NULL DEFAULT 0,
        "displayOrder" INTEGER NOT NULL DEFAULT 0,
        "eventDate" TEXT,
        "mediaType" TEXT DEFAULT 'IMAGE',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "GalleryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "GalleryCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GalleryItem_categoryId_idx" ON "GalleryItem"("categoryId");`);

    // 3. Ensure mediaType column exists on GalleryItem (for tables created previously without mediaType)
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "GalleryItem" ADD COLUMN "mediaType" TEXT DEFAULT 'IMAGE';`);
    } catch {
      // Ignored if column already exists
    }

    // 4. Ensure default categories exist if empty
    try {
      const existingCats: any[] = await prisma.$queryRawUnsafe(`SELECT count(*) as count FROM "GalleryCategory";`);
      const count = Number(existingCats[0]?.count ?? 0);
      if (count === 0) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "GalleryCategory" ("name", "slug", "displayOrder", "isVisible")
          VALUES 
            ('Campus & Facilities', 'campus-facilities', 1, 1),
            ('Events & Celebrations', 'events-celebrations', 2, 1),
            ('Toppers & Achievers', 'toppers-achievers', 3, 1),
            ('Classroom & Seminars', 'classroom-seminars', 4, 1);
        `);
        console.log("[DB] Seeded 4 default gallery categories");
      }
    } catch (e) {
      console.warn("[DB] Could not verify/seed default gallery categories:", e);
    }

    console.log("[DB] Dynamic schema verification: Gallery tables are ready.");
  } catch (error) {
    console.error("[DB] Failed to verify/create database tables:", error);
  }
}
