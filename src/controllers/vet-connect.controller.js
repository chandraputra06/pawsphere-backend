const asyncHandler = require("../utils/async-handler");
const { successResponse } = require("../utils/response");
const {
  listVets,
  getVetById,
  createConsultation,
  listMyConsultations,
  listVetConsultations,
  listMessages,
  sendMessage,
  updateStatus,
} = require("../services/vet-connect.service");

// GET /api/vet-connect/vets  (public)
const getVets = asyncHandler(async (req, res) => {
  const vets = await listVets();
  return successResponse(res, 200, "Vets retrieved successfully", vets);
});

// GET /api/vet-connect/vets/:id  (public)
const getVet = asyncHandler(async (req, res) => {
  const vet = await getVetById(req.params.id);
  return successResponse(res, 200, "Vet retrieved successfully", vet);
});

// POST /api/vet-connect/consultations  (auth)
const postConsultation = asyncHandler(async (req, res) => {
  const { vet_profile_id, method, notes } = req.body;
  const consultation = await createConsultation({
    userId: req.user.id,
    vetProfileId: vet_profile_id,
    method,
    notes,
  });
  return successResponse(res, 201, "Consultation booked successfully", consultation);
});

// GET /api/vet-connect/consultations  (auth - patient's own)
const getMyConsultations = asyncHandler(async (req, res) => {
  const consultations = await listMyConsultations(req.user.id);
  return successResponse(res, 200, "Consultations retrieved successfully", consultations);
});

// GET /api/vet-connect/vet/consultations  (auth - vet only)
const getVetConsultations = asyncHandler(async (req, res) => {
  const consultations = await listVetConsultations(req.user.id);
  return successResponse(res, 200, "Vet consultations retrieved successfully", consultations);
});

// GET /api/vet-connect/consultations/:id/messages  (auth - participant)
const getMessages = asyncHandler(async (req, res) => {
  const messages = await listMessages(req.params.id, req.user.id);
  return successResponse(res, 200, "Messages retrieved successfully", messages);
});

// POST /api/vet-connect/consultations/:id/messages  (auth - participant)
const postMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const message = await sendMessage(req.params.id, req.user.id, content);
  return successResponse(res, 201, "Message sent successfully", message);
});

// PATCH /api/vet-connect/consultations/:id/status  (auth - vet only)
const patchStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updated = await updateStatus(req.params.id, req.user.id, status);
  return successResponse(res, 200, "Status updated successfully", updated);
});

module.exports = {
  getVets,
  getVet,
  postConsultation,
  getMyConsultations,
  getVetConsultations,
  getMessages,
  postMessage,
  patchStatus,
};