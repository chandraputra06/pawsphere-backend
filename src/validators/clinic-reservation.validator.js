const { body, header, param } = require("express-validator");

const idempotencyHeader = header("idempotency-key")
  .trim()
  .isUUID(4)
  .withMessage("Idempotency-Key must be a UUID v4");

const createReservationValidator = [
  param("clinicId").trim().notEmpty().isLength({ max: 191 }),
  idempotencyHeader,
  body("serviceType")
    .trim()
    .isIn(["konsultasi", "rawat_inap", "penitipan"])
    .withMessage("serviceType is invalid"),
  body("careMethod")
    .trim()
    .isIn(["klinik", "rumah"])
    .withMessage("careMethod is invalid"),
  body("paymentMethod")
    .trim()
    .isIn(["cash", "qris"])
    .withMessage("paymentMethod must be cash or qris"),
  body("petName").trim().notEmpty().isLength({ max: 100 }),
  body("petType").optional({ values: "falsy" }).trim().isLength({ max: 100 }),
  body("petAge").optional({ values: "falsy" }).trim().isLength({ max: 50 }),
  body("petWeight").optional({ values: "falsy" }).trim().isLength({ max: 50 }),
  body("doctorName").optional({ values: "falsy" }).trim().isLength({ max: 150 }),
  body("scheduleDate").optional({ values: "falsy" }).trim().isLength({ max: 100 }),
  body("scheduleTime").optional({ values: "falsy" }).trim().isLength({ max: 50 }),
  body("checkInDate").optional({ values: "falsy" }).isISO8601({ strict: true }),
  body("checkOutDate").optional({ values: "falsy" }).isISO8601({ strict: true }),
  body("complaint").optional({ values: "falsy" }).trim().isLength({ max: 5000 }),
  body("notes").optional({ values: "falsy" }).trim().isLength({ max: 5000 }),
  body("address").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
  body("phone").optional({ values: "falsy" }).trim().isLength({ max: 30 }),
];

const reservationIdValidator = [
  param("id").isUUID().withMessage("Reservation id is invalid"),
];

const updateAddressValidator = [
  ...reservationIdValidator,
  body("address").trim().notEmpty().isLength({ max: 2000 }),
  body("phone").trim().notEmpty().isLength({ min: 7, max: 30 }),
];

module.exports = {
  createReservationValidator,
  reservationIdValidator,
  updateAddressValidator,
};
