const express = require("express");

const {
  getVets,
  getVet,
  postConsultation,
  getMyConsultations,
  getVetConsultations,
  getMessages,
  postMessage,
  patchStatus,
  getRx,
  putRx,
} = require("../controllers/vet-connect.controller");
const {
  createConsultationValidator,
  messageValidator,
  statusValidator,
} = require("../validators/vet-connect.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");

const router = express.Router();

// Public: browse vets
router.get("/vets", getVets);
router.get("/vets/:id", getVet);

// Vet-only: incoming consultations
router.get("/vet/consultations", authenticate, authorize("vet"), getVetConsultations);

// Auth: bookings
router.post(
  "/consultations",
  authenticate,
  createConsultationValidator,
  validate,
  postConsultation
);
router.get("/consultations", authenticate, getMyConsultations);

// Auth (participant): chat messages
router.get("/consultations/:id/messages", authenticate, getMessages);
router.post(
  "/consultations/:id/messages",
  authenticate,
  messageValidator,
  validate,
  postMessage
);

// Vet-only: change status
router.patch(
  "/consultations/:id/status",
  authenticate,
  authorize("vet"),
  statusValidator,
  validate,
  patchStatus
);

// E-Resep
router.get("/consultations/:id/prescription", authenticate, getRx);
router.put("/consultations/:id/prescription", authenticate, authorize("vet"), putRx);

module.exports = router;