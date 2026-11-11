const prisma = require("../config/prisma");
const ApiError = require("../utils/api-error");

// Klinik yang dikelola seorang user (role klinik).
const getManagedClinic = async (ownerUserId) => {
  const clinic = await prisma.clinic.findFirst({ where: { ownerUserId } });
  if (!clinic) throw ApiError.notFound("Anda belum terhubung ke klinik mana pun");
  return clinic;
};

const mapReservation = (r) => ({
  id: r.id,
  serviceType: r.serviceType,
  careMethod: r.careMethod,
  petName: r.petName,
  petType: r.petType,
  petAge: r.petAge,
  petWeight: r.petWeight,
  doctorName: r.doctorName,
  scheduleDate: r.scheduleDate,
  scheduleTime: r.scheduleTime,
  checkInDate: r.checkInDate,
  checkOutDate: r.checkOutDate,
  complaint: r.complaint,
  notes: r.notes,
  address: r.address,
  phone: r.phone,
  estimatedTotal: r.estimatedTotal,
  status: r.status,
  bookingCode: r.bookingCode,
  queueNumber: r.queueNumber,
  createdAt: r.createdAt,
  customer: r.user ? { name: r.user.name, email: r.user.email } : null,
});

const getDashboard = async (ownerUserId) => {
  const clinic = await getManagedClinic(ownerUserId);
  const [pending, confirmed, completed, cancelled, total] = await Promise.all([
    prisma.clinicReservation.count({ where: { clinicId: clinic.id, status: "pending" } }),
    prisma.clinicReservation.count({ where: { clinicId: clinic.id, status: "confirmed" } }),
    prisma.clinicReservation.count({ where: { clinicId: clinic.id, status: "completed" } }),
    prisma.clinicReservation.count({ where: { clinicId: clinic.id, status: "cancelled" } }),
    prisma.clinicReservation.count({ where: { clinicId: clinic.id } }),
  ]);
  return {
    clinic: { id: clinic.id, name: clinic.name, area: clinic.area, image: clinic.image },
    stats: { pending, confirmed, completed, cancelled, total },
  };
};

const listReservations = async (ownerUserId, { status } = {}) => {
  const clinic = await getManagedClinic(ownerUserId);
  const where = { clinicId: clinic.id };
  if (status && status !== "all") where.status = status;
  const rows = await prisma.clinicReservation.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapReservation);
};

const updateReservationStatus = async (ownerUserId, reservationId, status) => {
  const clinic = await getManagedClinic(ownerUserId);
  const reservation = await prisma.clinicReservation.findUnique({ where: { id: reservationId } });
  if (!reservation || reservation.clinicId !== clinic.id) {
    throw ApiError.notFound("Reservasi tidak ditemukan");
  }
  const updated = await prisma.clinicReservation.update({
    where: { id: reservationId },
    data: { status },
    include: { user: true },
  });
  return mapReservation(updated);
};

module.exports = { getDashboard, listReservations, updateReservationStatus };