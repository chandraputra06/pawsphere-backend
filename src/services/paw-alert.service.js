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

// For shelters/admin: active reports to respond to.
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

module.exports = {
  createReport,
  listMyReports,
  listActiveReports,
  updateReportStatus,
};