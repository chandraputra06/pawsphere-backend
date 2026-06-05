const asyncHandler = require("../utils/async-handler");
const { successResponse } = require("../utils/response");
const {
  createAiTriage,
  findUserTriageHistories,
  findTriageById,
} = require("../services/ai-chat.service");

// POST /api/ai-chat/triage  (requires authentication)
const createTriage = asyncHandler(async (req, res) => {
  const { animal_type, age, symptoms, duration, additional_condition } =
    req.body;

  const result = await createAiTriage({
    userId: req.user.id,
    animalType: animal_type,
    age,
    symptoms,
    duration,
    additionalCondition: additional_condition,
  });

  return successResponse(res, 201, "AI triage generated successfully", result);
});

// GET /api/ai-chat/histories  (requires authentication)
const getMyTriageHistories = asyncHandler(async (req, res) => {
  const histories = await findUserTriageHistories(req.user.id);

  return successResponse(
    res,
    200,
    "AI triage histories retrieved successfully",
    histories
  );
});

// GET /api/ai-chat/histories/:id  (requires authentication)
const getTriageById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const triage = await findTriageById(id, req.user.id);

  return successResponse(
    res,
    200,
    "AI triage retrieved successfully",
    triage
  );
});

module.exports = {
  createTriage,
  getMyTriageHistories,
  getTriageById,
};
