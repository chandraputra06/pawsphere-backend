// prisma/seedClinics.js
// Seed klinik mitra + akun demo klinik + reservasi contoh.
// Jalankan: node prisma/seedClinics.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const RAW_CLINICS = [
  {
    id: "satwa-medika", number: 1, name: "Klinik Satwa Medika",
    shortArea: "Renon", area: "Renon, Denpasar",
    address: "Jl. Tukad Yeh Aya No. 28, Renon, Denpasar",
    distance: "2,4 km", distanceKm: 2.4, isOpenNow: true,
    openStatus: "hingga 20.00", hours: "08.00–20.00",
    coordinates: [-8.6725, 115.2335],
    image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80",
    ],
    doctor: { name: "drh. Putu Ayu Pratiwi", clinicName: "Klinik Satwa Medika", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80" },
    hospitalizationBadge: "Rawat inap 3/8", hospitalizationFull: false,
    boardingBadge: "Penitipan 5/12", startingPrice: "Rp150.000",
    homeCarePrice: "Mulai Rp225.000", inpatientPrice: "Mulai Rp250.000 / malam",
    boardingPrice: "Mulai Rp150.000 / malam",
    availableServices: ["hospitalization", "boarding", "consultation", "vaccination"],
  },
  {
    id: "bali-pet-care", number: 2, name: "Bali Pet Care",
    shortArea: "Sanur", area: "Sanur, Denpasar",
    address: "Jl. Bypass Ngurah Rai No. 88, Sanur, Denpasar",
    distance: "5,1 km", distanceKm: 5.1, isOpenNow: true,
    openStatus: "hingga 21.00", hours: "09.00–21.00",
    coordinates: [-8.6965, 115.262],
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80",
    ],
    doctor: { name: "drh. I Made Wirawan", clinicName: "Bali Pet Care", avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80" },
    hospitalizationBadge: "Rawat inap 2/6", hospitalizationFull: false,
    boardingBadge: "Penitipan 2/10", startingPrice: "Rp175.000",
    homeCarePrice: "Mulai Rp250.000", inpatientPrice: "Mulai Rp275.000 / malam",
    boardingPrice: "Mulai Rp175.000 / malam",
    availableServices: ["hospitalization", "boarding", "consultation", "vaccination"],
  },
  {
    id: "ubud-animal-wellness", number: 3, name: "Ubud Animal Wellness",
    shortArea: "Ubud", area: "Ubud, Gianyar",
    address: "Jl. Raya Sukawati - Ubud No. 14, Gianyar",
    distance: "24 km", distanceKm: 24.0, isOpenNow: false,
    openStatus: "Buka besok 08.00", hours: "08.00–18.00",
    coordinates: [-8.618, 115.2485],
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80",
    ],
    doctor: { name: "drh. Ni Luh Gede Saraswati", clinicName: "Ubud Animal Wellness", avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=200&q=80" },
    hospitalizationBadge: "Rawat inap penuh", hospitalizationFull: true,
    boardingBadge: "Penitipan 4/8", startingPrice: "Rp160.000",
    homeCarePrice: "Mulai Rp240.000", inpatientPrice: "Penuh sementara",
    boardingPrice: "Mulai Rp160.000 / malam",
    availableServices: ["boarding", "consultation"],
  },
];

const toRow = (c) => {
  const [latitude, longitude] = c.coordinates || [null, null];
  return {
    number: c.number, name: c.name, shortArea: c.shortArea ?? null, area: c.area,
    address: c.address ?? null, distance: c.distance ?? null, distanceKm: c.distanceKm ?? null,
    isOpenNow: c.isOpenNow ?? true, openStatus: c.openStatus ?? null, hours: c.hours ?? null,
    latitude, longitude, image: c.image ?? null, images: c.images ?? null, doctor: c.doctor ?? null,
    hospitalizationBadge: c.hospitalizationBadge ?? null, hospitalizationFull: c.hospitalizationFull ?? false,
    boardingBadge: c.boardingBadge ?? null, startingPrice: c.startingPrice ?? null,
    homeCarePrice: c.homeCarePrice ?? null, inpatientPrice: c.inpatientPrice ?? null,
    boardingPrice: c.boardingPrice ?? null, availableServices: c.availableServices ?? null,
    isVerified: true,
  };
};

const DEMO_RESERVATIONS = [
  { bookingCode: "PS-C-261112-001", serviceType: "konsultasi", careMethod: "klinik", petName: "Milo", petType: "Kucing domestik", petAge: "2 tahun", petWeight: "4 kg", doctorName: "drh. Putu Ayu Pratiwi", scheduleDate: "Kamis, 12 November 2026", scheduleTime: "10.00", complaint: "Kurang nafsu makan 2 hari", estimatedTotal: 150000, status: "pending", queueNumber: "A-012" },
  { bookingCode: "PS-H-261112-002", serviceType: "konsultasi", careMethod: "rumah", petName: "Bella", petType: "Anjing", petAge: "3 tahun", petWeight: "8 kg", doctorName: "drh. Putu Ayu Pratiwi", scheduleDate: "Kamis, 12 November 2026", scheduleTime: "13.00", complaint: "Ada luka di kaki belakang", address: "Jl. Renon No. 10, Denpasar", phone: "0812 3456 7890", estimatedTotal: 15000, status: "confirmed" },
  { bookingCode: "PS-I-261112-003", serviceType: "rawat_inap", careMethod: "klinik", petName: "Oyen", petType: "Kucing", petAge: "1 tahun", petWeight: "3 kg", checkInDate: "12 Nov 2026", checkOutDate: "14 Nov 2026", notes: "Pemantauan pasca operasi", estimatedTotal: 505000, status: "completed" },
];

async function main() {
  for (const c of RAW_CLINICS) {
    const row = toRow(c);
    await prisma.clinic.upsert({ where: { id: c.id }, update: {}, create: { id: c.id, ...row } });
  }
  console.log(`✅ ${RAW_CLINICS.length} klinik ter-seed`);

  // Akun demo pengelola klinik
  const manager = await prisma.user.upsert({
    where: { email: "klinik@pawsphere.test" },
    update: { role: "klinik" },
    create: { name: "Admin Klinik Satwa Medika", email: "klinik@pawsphere.test", password: await bcrypt.hash("klinik123", 10), role: "klinik" },
  });
  await prisma.clinic.update({ where: { id: "satwa-medika" }, data: { ownerUserId: manager.id } });
  console.log("✅ Akun klinik demo → klinik@pawsphere.test / klinik123");

  // Pasien demo + reservasi contoh untuk klinik satwa-medika
  const patient = await prisma.user.upsert({
    where: { email: "pemilik@pawsphere.test" },
    update: {},
    create: { name: "Budi Pemilik", email: "pemilik@pawsphere.test", password: await bcrypt.hash("pemilik123", 10), role: "user" },
  });
  for (const r of DEMO_RESERVATIONS) {
    await prisma.clinicReservation.upsert({
      where: { bookingCode: r.bookingCode },
      update: {},
      create: { ...r, clinicId: "satwa-medika", userId: patient.id },
    });
  }
  console.log(`✅ ${DEMO_RESERVATIONS.length} reservasi contoh ter-seed`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());