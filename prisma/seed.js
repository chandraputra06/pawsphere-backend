// Seeds a few default accounts so you can test login immediately.
// Run with: npm run db:seed
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const seedUsers = [
  {
    name: "Admin PawSphere",
    email: "admin@pawsphere.id",
    password: "password123",
    role: "admin",
  },
  {
    name: "Pengguna Demo",
    email: "user@pawsphere.id",
    password: "password123",
    role: "user",
  },
];

async function main() {
  console.log("Seeding database...");

  for (const seed of seedUsers) {
    const hashedPassword = await bcrypt.hash(seed.password, SALT_ROUNDS);

    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: {},
      create: {
        name: seed.name,
        email: seed.email,
        password: hashedPassword,
        role: seed.role,
      },
    });

    console.log(`  - ${user.role.padEnd(6)} | ${user.email}`);
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
