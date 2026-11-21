import { prisma } from "../lib/prisma";

function utcDateOffset(daysFromToday: number): Date {
  const now = new Date();
  const utc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysFromToday)
  );
  return utc;
}

async function main() {
  await prisma.tempahan.deleteMany();

  await prisma.tempahan.createMany({
    data: [
      {
        nama_pemohon: "Ahmad Danish Hakim",
        item_tempahan: "Bilik Perbincangan 1",
        tarikh: utcDateOffset(0),
        slot_masa: "8:00-10:00",
        status: "Diluluskan",
      },
      {
        nama_pemohon: "Nurul Aina Syafiqah",
        item_tempahan: "Makmal Komputer 1",
        tarikh: utcDateOffset(0),
        slot_masa: "10:00-12:00",
        status: "Menunggu",
      },
      {
        nama_pemohon: "Muhammad Faizuddin",
        item_tempahan: "Kamera DSLR",
        tarikh: utcDateOffset(0),
        slot_masa: "14:00-16:00",
        status: "Menunggu",
      },
      {
        nama_pemohon: "Siti Hajar Zulkifli",
        item_tempahan: "Bola Futsal",
        tarikh: utcDateOffset(0),
        slot_masa: "16:00-18:00",
        status: "Diluluskan",
      },
      {
        nama_pemohon: "Tan Wei Ming",
        item_tempahan: "Bilik Perbincangan 2",
        tarikh: utcDateOffset(1),
        slot_masa: "10:00-12:00",
        status: "Menunggu",
      },
      {
        nama_pemohon: "Priya Darshini",
        item_tempahan: "Tripod",
        tarikh: utcDateOffset(1),
        slot_masa: "14:00-16:00",
        status: "Diluluskan",
      },
      {
        nama_pemohon: "Amirul Mukminin",
        item_tempahan: "Makmal Komputer 2",
        tarikh: utcDateOffset(2),
        slot_masa: "8:00-10:00",
        status: "Ditolak",
      },
      {
        nama_pemohon: "Farah Nabilah Azman",
        item_tempahan: "Raket Badminton",
        tarikh: utcDateOffset(2),
        slot_masa: "16:00-18:00",
        status: "Menunggu",
      },
      {
        nama_pemohon: "Haziq Irfan Roslan",
        item_tempahan: "Bilik Perbincangan 1",
        tarikh: utcDateOffset(-1),
        slot_masa: "14:00-16:00",
        status: "Diluluskan",
      },
      {
        nama_pemohon: "Lim Kah Yan",
        item_tempahan: "Kamera DSLR",
        tarikh: utcDateOffset(3),
        slot_masa: "8:00-10:00",
        status: "Menunggu",
      },
    ],
  });

  console.log("Seeded 10 Tempahan records successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
