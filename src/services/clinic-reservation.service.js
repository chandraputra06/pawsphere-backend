const crypto = require("crypto");
const prisma = require("../config/prisma");
const ApiError = require("../utils/api-error");
const {
  amountToMinorUnits,
  createQrisRedirect,
  verifyNotificationSignature,
} = require("./midtrans.service");
const {
  countNights,
  createRequestFingerprint,
  parsePrice,
  toPublicReservation,
} = require("../utils/clinic-payment");

const PLATFORM_FEE = 5000;
const HOME_VISIT_FEE = 10000;

const normalizeOptional = (value) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || null;
};

const calculatePrice = (clinic, input) => {
  if (input.serviceType === "konsultasi" && input.careMethod === "rumah") {
    return {
      amount: HOME_VISIT_FEE + PLATFORM_FEE,
      itemDetails: [
        { id: "home-visit", price: HOME_VISIT_FEE, quantity: 1, name: "Kunjungan dokter" },
        { id: "platform-fee", price: PLATFORM_FEE, quantity: 1, name: "Biaya platform PawSphere" },
      ],
    };
  }

  if (input.careMethod !== "klinik" || input.serviceType === "konsultasi") {
    throw ApiError.badRequest("Metode layanan klinik tidak valid");
  }

  const requiredService =
    input.serviceType === "rawat_inap" ? "hospitalization" : "boarding";
  if (
    !Array.isArray(clinic.availableServices) ||
    !clinic.availableServices.includes(requiredService)
  ) {
    throw ApiError.badRequest("Layanan tersebut tidak tersedia di klinik ini");
  }
  if (input.serviceType === "rawat_inap" && clinic.hospitalizationFull) {
    throw ApiError.conflict("Kapasitas rawat inap klinik sedang penuh");
  }

  const nights = countNights(input.checkInDate, input.checkOutDate);
  if (!nights) {
    throw ApiError.badRequest("Tanggal check-in dan check-out tidak valid");
  }

  const nightlyRate = parsePrice(
    input.serviceType === "rawat_inap"
      ? clinic.inpatientPrice
      : clinic.boardingPrice
  );
  if (!nightlyRate) {
    throw ApiError.badRequest("Harga layanan klinik belum dikonfigurasi");
  }

  const accommodationAmount = nightlyRate * nights;
  return {
    amount: accommodationAmount + PLATFORM_FEE,
    itemDetails: [
      {
        id: input.serviceType,
        price: nightlyRate,
        quantity: nights,
        name: input.serviceType === "rawat_inap" ? "Rawat inap" : "Penitipan",
      },
      { id: "platform-fee", price: PLATFORM_FEE, quantity: 1, name: "Biaya platform PawSphere" },
    ],
  };
};

const getByIdempotencyKey = async (idempotencyKey) =>
  prisma.clinicReservation.findUnique({
    where: { idempotencyKey },
    include: { clinic: true },
  });

const replayIdempotentRequest = (existing, userId, fingerprint) => {
  if (
    existing.userId !== userId ||
    existing.idempotencyFingerprint !== fingerprint
  ) {
    throw ApiError.conflict(
      "Idempotency-Key sudah digunakan untuk permintaan yang berbeda"
    );
  }

  if (
    existing.paymentMethod === "qris" &&
    existing.paymentStatus === "pending" &&
    !existing.snapRedirectUrl
  ) {
    throw ApiError.conflict(
      "Sesi pembayaran sedang diproses. Muat ulang beberapa saat lagi."
    );
  }

  return toPublicReservation(existing);
};

const createReservation = async ({
  clinicId,
  userId,
  idempotencyKey,
  input,
}) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Akun tidak aktif atau tidak ditemukan");
  }

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic || !clinic.isVerified) {
    throw ApiError.notFound("Klinik tidak ditemukan");
  }

  const normalized = {
    clinicId,
    serviceType: input.serviceType,
    careMethod: input.careMethod,
    paymentMethod: input.paymentMethod,
    petName: input.petName.trim(),
    petType: normalizeOptional(input.petType),
    petAge: normalizeOptional(input.petAge),
    petWeight: normalizeOptional(input.petWeight),
    doctorName: normalizeOptional(input.doctorName),
    scheduleDate: normalizeOptional(input.scheduleDate),
    scheduleTime: normalizeOptional(input.scheduleTime),
    checkInDate: normalizeOptional(input.checkInDate),
    checkOutDate: normalizeOptional(input.checkOutDate),
    complaint: normalizeOptional(input.complaint),
    notes: normalizeOptional(input.notes),
    address: normalizeOptional(input.address),
    phone: normalizeOptional(input.phone) || user.phoneNumber,
  };
  const fingerprint = createRequestFingerprint(normalized);

  const existing = await getByIdempotencyKey(idempotencyKey);
  if (existing) {
    return replayIdempotentRequest(existing, userId, fingerprint);
  }

  const { amount, itemDetails } = calculatePrice(clinic, normalized);
  const reservationId = crypto.randomUUID();
  const serviceCode =
    normalized.serviceType === "rawat_inap"
      ? "I"
      : normalized.serviceType === "penitipan"
        ? "P"
        : normalized.careMethod === "rumah"
          ? "H"
          : "C";
  const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const bookingCode = `PS-${serviceCode}-${dateCode}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
  const midtransOrderId =
    normalized.paymentMethod === "qris" ? `PS-${reservationId}` : null;

  let reservation;
  try {
    reservation = await prisma.clinicReservation.create({
      data: {
        id: reservationId,
        ...normalized,
        estimatedTotal: amount,
        bookingCode,
        paymentMethod: normalized.paymentMethod,
        paymentStatus:
          normalized.paymentMethod === "qris" ? "pending" : "cash_due",
        idempotencyKey,
        idempotencyFingerprint: fingerprint,
        midtransOrderId,
        queueNumber: normalized.serviceType === "konsultasi" ? "A-012" : null,
      },
      include: { clinic: true },
    });
  } catch (error) {
    if (error.code === "P2002") {
      const concurrentRequest = await getByIdempotencyKey(idempotencyKey);
      if (concurrentRequest) {
        return replayIdempotentRequest(
          concurrentRequest,
          userId,
          fingerprint
        );
      }
    }
    throw error;
  }

  if (normalized.paymentMethod === "cash") {
    return toPublicReservation(reservation);
  }

  try {
    const checkout = await createQrisRedirect({
      reservation,
      user,
      itemDetails,
    });
    reservation = await prisma.clinicReservation.update({
      where: { id: reservation.id },
      data: {
        snapToken: checkout.token,
        snapRedirectUrl: checkout.redirectUrl,
      },
      include: { clinic: true },
    });
  } catch (error) {
    await prisma.clinicReservation.update({
      where: { id: reservation.id },
      data: { paymentStatus: "failed", paymentProviderStatus: "creation_failed" },
    });
    throw error;
  }

  return toPublicReservation(reservation);
};

const getReservation = async (reservationId, userId) => {
  const reservation = await prisma.clinicReservation.findFirst({
    where: { id: reservationId, userId },
    include: { clinic: true },
  });
  if (!reservation) throw ApiError.notFound("Reservasi tidak ditemukan");
  return toPublicReservation(reservation);
};

const updateReservationAddress = async (reservationId, userId, { address, phone }) => {
  const reservation = await prisma.clinicReservation.findFirst({
    where: { id: reservationId, userId },
  });
  if (!reservation) throw ApiError.notFound("Reservasi tidak ditemukan");
  if (reservation.careMethod !== "rumah") {
    throw ApiError.badRequest("Alamat hanya dapat ditambahkan untuk kunjungan rumah");
  }
  if (
    reservation.paymentMethod === "qris" &&
    reservation.paymentStatus !== "paid"
  ) {
    throw ApiError.conflict("Pembayaran QRIS belum terkonfirmasi");
  }

  const updated = await prisma.clinicReservation.update({
    where: { id: reservationId },
    data: { address: address.trim(), phone: phone.trim() },
    include: { clinic: true },
  });
  return toPublicReservation(updated);
};

const applyMidtransNotification = async (notification) => {
  if (!verifyNotificationSignature(notification)) {
    throw ApiError.unauthorized("Signature notifikasi Midtrans tidak valid");
  }

  const orderId = notification.order_id;
  const reservation = await prisma.clinicReservation.findUnique({
    where: { midtransOrderId: orderId },
  });

  if (!reservation) return { received: true };

  const receivedAmount = amountToMinorUnits(notification.gross_amount);
  const expectedAmount = BigInt(reservation.estimatedTotal) * 100n;
  if (receivedAmount === null || receivedAmount !== expectedAmount) {
    throw ApiError.badRequest("Jumlah notifikasi pembayaran tidak sesuai");
  }

  const incomingProviderStatus = String(notification.transaction_status || "");
  const mappedStatus = {
    settlement: "paid",
    capture:
      notification.fraud_status === "accept" ? "paid" : "pending",
    pending: "pending",
    deny: "failed",
    failure: "failed",
    cancel: "cancelled",
    expire: "expired",
    refund: "refunded",
    partial_refund: "partially_refunded",
  }[incomingProviderStatus];

  if (!mappedStatus) return { received: true };

  const now = new Date();
  if (mappedStatus === "paid") {
    await prisma.clinicReservation.updateMany({
      where: {
        id: reservation.id,
        paymentStatus: { notIn: ["refunded", "partially_refunded"] },
      },
      data: {
        paymentStatus: "paid",
        paymentProviderStatus: incomingProviderStatus,
        midtransTransactionId:
          notification.transaction_id || reservation.midtransTransactionId,
        paidAt: reservation.paidAt || now,
      },
    });
  } else {
    await prisma.clinicReservation.updateMany({
      where: {
        id: reservation.id,
        paymentStatus:
          mappedStatus === "refunded"
            ? { in: ["paid", "partially_refunded"] }
            : mappedStatus === "partially_refunded"
              ? "paid"
              : "pending",
      },
      data: {
        paymentStatus: mappedStatus,
        paymentProviderStatus: incomingProviderStatus,
        midtransTransactionId:
          notification.transaction_id || reservation.midtransTransactionId,
      },
    });
  }

  return { received: true };
};

module.exports = {
  applyMidtransNotification,
  createReservation,
  getReservation,
  updateReservationAddress,
};
