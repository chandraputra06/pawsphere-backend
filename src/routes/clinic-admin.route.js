const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { statusValidator } = require("../validators/clinic-admin.validator");
const {
  getMyDashboard,
  getReservations,
  patchReservationStatus,
} = require("../controllers/clinic-admin.controller");

const router = express.Router();

// Semua endpoint khusus role "klinik".
router.use(authenticate, authorize("klinik"));

router.get("/me", getMyDashboard);
router.get("/reservations", getReservations);
router.patch("/reservations/:id/status", statusValidator, validate, patchReservationStatus);

module.exports = router;