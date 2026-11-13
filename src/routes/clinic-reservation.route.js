const express = require("express");
const { authenticate } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createReservationValidator,
  reservationIdValidator,
  updateAddressValidator,
} = require("../validators/clinic-reservation.validator");
const {
  getMyReservation,
  patchReservationAddress,
  postMidtransNotification,
  postReservation,
} = require("../controllers/clinic-reservation.controller");

const router = express.Router();

router.post(
  "/:clinicId/reservations",
  authenticate,
  createReservationValidator,
  validate,
  postReservation
);
router.get(
  "/reservations/:id",
  authenticate,
  reservationIdValidator,
  validate,
  getMyReservation
);
router.patch(
  "/reservations/:id/address",
  authenticate,
  updateAddressValidator,
  validate,
  patchReservationAddress
);
router.post("/midtrans/notification", postMidtransNotification);

module.exports = router;
