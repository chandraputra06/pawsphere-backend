const express = require("express");

const {
  postReport,
  getMyReports,
  getActiveReports,
  patchStatus,
  getShelters,
  getMapReports,
} = require("../controllers/paw-alert.controller");
const { createReportValidator, statusValidator } = require("../validators/paw-alert.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");

const router = express.Router();

// Public: direktori shelter (tampil juga sebelum login).
router.get("/shelters", getShelters);

// Anyone logged in can report.
router.post("/reports", authenticate, createReportValidator, validate, postReport);
router.get("/reports/mine", authenticate, getMyReports);
// Public: direktori shelter + laporan untuk peta.
router.get("/shelters", getShelters);
router.get("/reports/map", getMapReports);

// Shelters/admins handle reports.
router.get("/reports", authenticate, authorize("shelter", "admin"), getActiveReports);
router.patch(
  "/reports/:id/status",
  authenticate,
  authorize("shelter", "admin"),
  statusValidator,
  validate,
  patchStatus
);

module.exports = router;