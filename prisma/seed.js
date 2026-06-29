// Seeds default accounts + demo vet profiles so you can test immediately.
// Run with: npm run db:seed
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const seedUsers = [
  { name: "Admin PawSphere", email: "admin@pawsphere.id", password: "password123", role: "admin" },
  { name: "Pengguna Demo", email: "user@pawsphere.id", password: "password123", role: "user" },
  { name: "Shelter Demo", email: "shelter@pawsphere.id", password: "password123", role: "shelter" },
];

const seedVets = [
  {
    name: "drh. Demo Vet",
    email: "vet@pawsphere.id",
    profile: {
      specialization: "Veterinarian Specialist",
      sipNumber: "SIP-001-2026",
      experienceYears: 10,
      consultationFee: 50000,
      rating: 4.9,
      location: "Denpasar, Bali",
      about: "Dokter hewan dengan fokus perawatan preventif dan penyakit kronis pada hewan kecil.",
      species: ["Cat", "Dog", "Hamster"],
      isAvailable: true,
      isVerified: true,
    },
  },
  {
    name: "drh. Rizki Prabowo",
    email: "rizki.vet@pawsphere.id",
    profile: {
      specialization: "Emergency Veterinarian",
      sipNumber: "SIP-002-2026",
      experienceYears: 8,
      consultationFee: 90000,
      rating: 4.9,
      location: "Jakarta Selatan",
      about: "Spesialis penanganan gawat darurat hewan peliharaan.",
      species: ["Cat", "Dog"],
      isAvailable: false,
      isVerified: true,
    },
  },
  {
    name: "drh. Muhammad Iqbal",
    email: "iqbal.vet@pawsphere.id",
    profile: {
      specialization: "Exotic Animal Specialist",
      sipNumber: "SIP-003-2026",
      experienceYears: 12,
      consultationFee: 50000,
      rating: 4.8,
      location: "Bandung, Jawa Barat",
      about: "Berpengalaman menangani hewan eksotik seperti burung dan reptil.",
      species: ["Cat", "Dog", "Bird"],
      isAvailable: true,
      isVerified: true,
    },
  },
  {
    name: "drh. Siti Nurhaliza Putri",
    email: "siti.vet@pawsphere.id",
    profile: {
      specialization: "Senior Veterinarian",
      sipNumber: "SIP-004-2026",
      experienceYears: 15,
      consultationFee: 50000,
      rating: 5.0,
      location: "Surabaya, Jawa Timur",
      about: "Dokter hewan senior dengan pengalaman luas di berbagai jenis hewan.",
      species: ["Cat", "Dog", "Rabbit"],
      isAvailable: true,
      isVerified: true,
    },
  },
];

async function main() {
  console.log("Seeding database...");

  for (const seed of seedUsers) {
    const hashedPassword = await bcrypt.hash(seed.password, SALT_ROUNDS);
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: {},
      create: { name: seed.name, email: seed.email, password: hashedPassword, role: seed.role },
    });
    console.log(`  - ${user.role.padEnd(6)} | ${user.email}`);
  }

  for (const vet of seedVets) {
    try {
      const hashedPassword = await bcrypt.hash("password123", SALT_ROUNDS);
      const user = await prisma.user.upsert({
        where: { email: vet.email },
        update: { name: vet.name },
        create: { name: vet.name, email: vet.email, password: hashedPassword, role: "vet" },
      });

      await prisma.vetProfile.upsert({
        where: { userId: user.id },
        update: { ...vet.profile },
        create: { userId: user.id, ...vet.profile },
      });

      console.log(`  - vet    | ${user.email} (profil terverifikasi)`);
    } catch (e) {
      console.error(`  ! GAGAL di ${vet.email}:`, e.message);
    }
  }

  console.log("Seeding complete.");
  console.log("Default password for all seeded accounts: password123");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });