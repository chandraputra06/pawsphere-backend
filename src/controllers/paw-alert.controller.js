const asyncHandler = require("../utils/async-handler");
const { successResponse } = require("../utils/response");
const {
  createReport,
  listMyReports,
  listActiveReports,
  updateReportStatus,
} = require("../services/paw-alert.service");

// POST /api/paw-alert/reports  (auth)
const postReport = asyncHandler(async (req, res) => {
  const { animal_type, condition, description, photo_url, latitude, longitude } = req.body;
  const report = await createReport({
    reporterUserId: req.user.id,
    animalType: animal_type,
    condition,
    description,
    photoUrl: photo_url,
    latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
    longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
  });
  return successResponse(res, 201, "Report submitted successfully", report);
});

// GET /api/paw-alert/reports/mine  (auth)
const getMyReports = asyncHandler(async (req, res) => {
  const reports = await listMyReports(req.user.id);
  return successResponse(res, 200, "Reports retrieved successfully", reports);
});

// GET /api/paw-alert/reports  (auth - shelter/admin)
const getActiveReports = asyncHandler(async (req, res) => {
  const reports = await listActiveReports();
  return successResponse(res, 200, "Active reports retrieved successfully", reports);
});

// PATCH /api/paw-alert/reports/:id/status  (auth - shelter/admin)
const patchStatus = asyncHandler(async (req, res) => {
  const report = await updateReportStatus(req.params.id, req.body.status);
  return successResponse(res, 200, "Report status updated successfully", report);
});

module.exports = { postReport, getMyReports, getActiveReports, patchStatus };