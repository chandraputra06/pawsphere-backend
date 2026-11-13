const crypto = require("crypto");

const toPublicReservation = (reservation) => ({
  id: reservation.id,
  clinicId: reservation.clinicId,
  clinic: reservation.clinic
    ? {
        id: reservation.clinic.id,
        name: reservation.clinic.name,
        address: reservation.clinic.address,
        area: reservation.clinic.area,
      }
    : undefined,
  serviceType: reservation.serviceType,
  careMethod: reservation.careMethod,
  petName: reservation.petName,
  petType: reservation.petType,
  petAge: reservation.petAge,
  petWeight: reservation.petWeight,
  doctorName: reservation.doctorName,
  scheduleDate: reservation.scheduleDate,
  scheduleTime: reservation.scheduleTime,
  checkInDate: reservation.checkInDate,
  checkOutDate: reservation.checkOutDate,
  complaint: reservation.complaint,
  notes: reservation.notes,
  address: reservation.address,
  phone: reservation.phone,
  estimatedTotal: reservation.estimatedTotal,
  status: reservation.status,
  bookingCode: reservation.bookingCode,
  queueNumber: reservation.queueNumber,
  paymentMethod: reservation.paymentMethod,
  paymentStatus: reservation.paymentStatus,
  midtransOrderId: reservation.midtransOrderId,
  snapRedirectUrl: reservation.snapRedirectUrl,
  paidAt: reservation.paidAt,
  createdAt: reservation.createdAt,
});

const createRequestFingerprint = (value) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

const parsePrice = (value) => {
  if (typeof value !== "string") return null;
  const match = value.match(/\d[\d.]*/);
  if (!match) return null;
  const price = Number(match[0].replace(/\D/g, ""));
  return Number.isSafeInteger(price) && price > 0 ? price : null;
};

const countNights = (checkInDate, checkOutDate) => {
  const isValidIsoDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };

  if (!isValidIsoDate(checkInDate) || !isValidIsoDate(checkOutDate)) return null;
  const nights =
    (Date.parse(`${checkOutDate}T00:00:00.000Z`) -
      Date.parse(`${checkInDate}T00:00:00.000Z`)) /
    86400000;
  return Number.isInteger(nights) && nights >= 1 && nights <= 30 ? nights : null;
};

module.exports = {
  countNights,
  createRequestFingerprint,
  parsePrice,
  toPublicReservation,
};
