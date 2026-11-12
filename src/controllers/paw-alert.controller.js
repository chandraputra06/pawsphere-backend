const asyncHandler = require("../utils/async-handler");
const { successResponse } = require("../utils/response");
const {
  createReport,
  listMyReports,
  listActiveReports,
  updateReportStatus,
  listShelters,
  listMapReports,
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

// GET /api/paw-alert/shelters  (public - direktori shelter terdekat)
const getShelters = asyncHandler(async (req, res) => {
  const shelters = await listShelters();
  return successResponse(res, 200, "Shelters retrieved successfully", shelters);
});

// GET /api/paw-alert/reports/map  (public - laporan aktif tanpa PII)
const getMapReports = asyncHandler(async (req, res) => {
  const reports = await listMapReports();
  return successResponse(res, 200, "Map reports retrieved successfully", reports);
});

module.exports = { postReport, getMyReports, getActiveReports, patchStatus, getShelters, getMapReports };