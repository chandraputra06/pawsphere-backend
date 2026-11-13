const asyncHandler = require("../utils/async-handler");
const { successResponse } = require("../utils/response");
const {
  applyMidtransNotification,
  createReservation,
  getReservation,
  updateReservationAddress,
} = require("../services/clinic-reservation.service");

const postReservation = asyncHandler(async (req, res) => {
  const data = await createReservation({
    clinicId: req.params.clinicId,
    userId: req.user.id,
    idempotencyKey: req.get("Idempotency-Key"),
    input: req.body,
  });
  return successResponse(res, 201, "Reservation created", data);
});

const getMyReservation = asyncHandler(async (req, res) => {
  const data = await getReservation(req.params.id, req.user.id);
  return successResponse(res, 200, "Reservation retrieved", data);
});

const patchReservationAddress = asyncHandler(async (req, res) => {
  const data = await updateReservationAddress(
    req.params.id,
    req.user.id,
    req.body
  );
  return successResponse(res, 200, "Reservation address updated", data);
});

const postMidtransNotification = asyncHandler(async (req, res) => {
  const data = await applyMidtransNotification(req.body);
  return successResponse(res, 200, "Notification received", data);
});

module.exports = {
  getMyReservation,
  patchReservationAddress,
  postMidtransNotification,
  postReservation,
};
