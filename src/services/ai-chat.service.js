const prisma = require("../config/prisma");
const ApiError = require("../utils/api-error");
const { generateTriage, generateChatReply } = require("./gemini.service");

// Maps a DB row to a clean API response shape (snake_case fields).
const mapTriageToResponse = (row) => ({
  id: row.id,
  user_id: row.userId,
  animal_type: row.animalType,
  age: row.age,
  symptoms: row.symptoms,
  duration: row.duration,
  additional_condition: row.additionalCondition,
  urgency_level: row.urgencyLevel,
  summary: row.summary,
  first_aid_advice: row.firstAidAdvice,
  recommendation: row.recommendation,
  source: row.source,
  disclaimer: row.disclaimer,
  created_at: row.createdAt,
  updated_at: row.updatedAt,
});

// Runs triage (Gemini or stub) and stores the result for the user.
const createAiTriage = async ({
  userId,
  animalType,
  age,
  symptoms,
  duration,
  additionalCondition,
}) => {
  const triage = await generateTriage({
    animalType,
    age,
    symptoms,
    duration,
    additionalCondition,
  });

  const saved = await prisma.aiTriageHistory.create({
    data: {
      userId,
      animalType,
      age,
      symptoms, // Json column
      duration,
      additionalCondition: additionalCondition || null,
      urgencyLevel: triage.urgencyLevel,
      summary: triage.summary,
      firstAidAdvice: triage.firstAidAdvice, // Json column
      recommendation: triage.recommendation,
      source: triage.source,
      disclaimer: triage.disclaimer,
    },
  });

  return mapTriageToResponse(saved);
};

// Returns the authenticated user's triage history, newest first.
const findUserTriageHistories = async (userId) => {
  const rows = await prisma.aiTriageHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(mapTriageToResponse);
};

// Returns a single triage record, scoped to its owner.
const findTriageById = async (id, userId) => {
  const row = await prisma.aiTriageHistory.findUnique({ where: { id } });

  if (!row || row.userId !== userId) {
    throw ApiError.notFound("Triage history not found");
  }

  return mapTriageToResponse(row);
};

// Free-form conversational reply (does not persist, like a normal chat).
const chatWithAi = async (messages) => generateChatReply({ messages });

module.exports = {
  createAiTriage,
  findUserTriageHistories,
  findTriageById,
  chatWithAi,
};