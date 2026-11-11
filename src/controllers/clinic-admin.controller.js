const asyncHandler = require("../utils/async-handler");
const { successResponse } = require("../utils/response");
const {
  getDashboard,
  listReservations,
  updateReservationStatus,
} = require("../services/clinic-admin.service");

const getMyDashboard = asyncHandler(async (req, res) => {
  const data = await getDashboard(req.user.id);
  return successResponse(res, 200, "Dashboard retrieved", data);
});

const getReservations = asyncHandler(async (req, res) => {
  const data = await listReservations(req.user.id, { status: req.query.status });
  return successResponse(res, 200, "Reservations retrieved", data);
});

const patchReservationStatus = asyncHandler(async (req, res) => {
  const data = await updateReservationStatus(req.user.id, req.params.id, req.body.status);
  return successResponse(res, 200, "Reservation status updated", data);
});

module.exports = { getMyDashboard, getReservations, patchReservationStatus };