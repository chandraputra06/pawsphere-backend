// prisma/seedShelters.js
// Seed shelter mitra (direktori) dengan koordinat.
// Jalankan: node prisma/seedShelters.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SHELTERS = [
  { id: "chandra-shelter",   name: "Chandra Shelter",   address: "Jl. Sudirman No. 45, Denpasar",        phoneNumber: "6281234567890", operatingHours: "10.00 - 16.00", isOpenNow: true,  latitude: -8.6705, longitude: 115.2126, description: "Shelter mitra PawSphere di Denpasar." },
  { id: "dean-shelter",      name: "Dean Shelter",      address: "Jl. Sudirman No. 45, Kuta",            phoneNumber: "6281298765432", operatingHours: "09.00 - 16.00", isOpenNow: true,  latitude: -8.7215, longitude: 115.1685, description: "Shelter mitra PawSphere di Kuta." },
  { id: "bali-animal-care",  name: "Bali Animal Care",  address: "Jl. Raya Ubud No. 12, Gianyar",        phoneNumber: "6281333445566", operatingHours: "08.00 - 17.00", isOpenNow: true,  latitude: -8.5069, longitude: 115.2625, description: "Shelter mitra PawSphere di Ubud." },
  { id: "bawa-shelter",      name: "BAWA Shelter",      address: "Jl. Sunset Road No. 88, Seminyak",     phoneNumber: "6281244556677", operatingHours: "07.00 - 19.00", isOpenNow: true,  latitude: -8.6915, longitude: 115.1590, description: "Shelter mitra PawSphere di Seminyak." },
  { id: "sanur-pet-rescue",  name: "Sanur Pet Rescue",  address: "Jl. Danau Tamblingan No. 3, Sanur",    phoneNumber: "6281255667788", operatingHours: "08.00 - 15.00", isOpenNow: false, latitude: -8.6839, longitude: 115.2624, description: "Shelter mitra PawSphere di Sanur." },
];

async function main() {
  for (const s of SHELTERS) {
    await prisma.shelter.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, verificationStatus: "approved", capacity: 10 },
    });
  }
  console.log(`✅ ${SHELTERS.length} shelter ter-seed`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());