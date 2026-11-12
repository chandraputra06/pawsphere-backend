const prisma = require("../config/prisma");
const ApiError = require("../utils/api-error");

const dicebear = (name) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || "user")}`;

const mapReport = (r) => ({
  id: r.id,
  animal_type: r.animalType,
  condition: r.condition,
  description: r.description,
  photo_url: r.photoUrl,
  latitude: r.latitude,
  longitude: r.longitude,
  status: r.status,
  created_at: r.createdAt,
  reporter: r.reporter
    ? {
        name: r.reporter.name,
        phone: r.reporter.phoneNumber || null,
        avatar: r.reporter.avatarUrl || dicebear(r.reporter.name),
      }
    : null,
});

// Bentuk shelter agar cocok dengan ShelterCard di frontend.
const mapShelter = (s) => ({
  id: s.id,
  name: s.name,
  address: s.address,
  status: s.isOpenNow ? "Buka" : "Tutup",
  hours: s.operatingHours || "-",
  phone: (s.phoneNumber || "").replace(/[^0-9]/g, ""),
  lat: s.latitude,
  lng: s.longitude,
});

const createReport = async ({
  reporterUserId,
  animalType,
  condition,
  description,
  photoUrl,
  latitude,
  longitude,
}) => {
  const report = await prisma.emergencyReport.create({
    data: {
      reporterUserId,
      animalType: animalType || "Tidak diketahui",
      condition: condition || "Perlu bantuan",
      description: description || null,
      photoUrl: photoUrl || null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      status: "open",
    },
  });
  return mapReport(report);
};

const listMyReports = async (userId) => {
  const rows = await prisma.emergencyReport.findMany({
    where: { reporterUserId: userId },
    include: { reporter: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapReport);
};

const listActiveReports = async () => {
  const rows = await prisma.emergencyReport.findMany({
    where: { status: { in: ["open", "responding"] } },
    include: { reporter: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapReport);
};

const updateReportStatus = async (id, status) => {
  const existing = await prisma.emergencyReport.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Laporan tidak ditemukan");

  const report = await prisma.emergencyReport.update({
    where: { id },
    data: { status },
    include: { reporter: true },
  });
  return mapReport(report);
};

// Direktori shelter mitra (yang terverifikasi & punya koordinat).
const listShelters = async () => {
  const rows = await prisma.shelter.findMany({
    where: {
      verificationStatus: "approved",
      latitude: { not: null },
      longitude: { not: null },
    },
    orderBy: { name: "asc" },
  });
  return rows.map(mapShelter);
};

// Laporan aktif untuk peta — TANPA data pelapor (publik).
const listMapReports = async () => {
  const rows = await prisma.emergencyReport.findMany({
    where: {
      status: { in: ["open", "responding"] },
      latitude: { not: null },
      longitude: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    animal_type: r.animalType,
    condition: r.condition,
    status: r.status,
    latitude: r.latitude,
    longitude: r.longitude,
    created_at: r.createdAt,
  }));
};

module.exports = {
  createReport,
  listMyReports,
  listActiveReports,
  updateReportStatus,
  listShelters,
  listMapReports,
};