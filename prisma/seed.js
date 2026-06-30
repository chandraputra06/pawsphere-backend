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

const seedProducts = [
  { name: "Amoxicillin 250mg Tablet", category: "obat", price: 45000, stock: 50, imageUrl: "/src/assets/product/Amoxicillin.png", requiresPrescription: true, description: "Antibiotik untuk infeksi bakteri pada hewan." },
  { name: "Probiotik Paste Premium", category: "vitamin", price: 89000, stock: 40, imageUrl: "/src/assets/product/Probiotik.png", requiresPrescription: false, description: "Menjaga kesehatan saluran cerna hewan." },
  { name: "Royal Canin Indoor Adult", category: "makanan", price: 185000, stock: 30, imageUrl: "/src/assets/product/Royal Canin.png", requiresPrescription: false, description: "Makanan kucing dewasa indoor." },
  { name: "Vitamin B Complex Drops", category: "vitamin", price: 65000, stock: 60, imageUrl: "/src/assets/product/Vitamin B.png", requiresPrescription: false, description: "Suplemen vitamin B untuk nafsu makan." },
  { name: "Anti-Tick & Flea Shampoo", category: "obat", price: 55000, stock: 45, imageUrl: "/src/assets/product/Shampoo.png", requiresPrescription: false, description: "Shampo anti kutu dan caplak." },
  { name: "Ivermectin 1% Injection", category: "obat", price: 35000, stock: 25, imageUrl: "/src/assets/product/Ivermectin.png", requiresPrescription: true, description: "Obat antiparasit injeksi." },
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

  for (const prod of seedProducts) {
    const existing = await prisma.product.findFirst({ where: { name: prod.name } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: { ...prod } });
    } else {
      await prisma.product.create({ data: { ...prod } });
    }
    console.log(`  - product | ${prod.name}`);
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