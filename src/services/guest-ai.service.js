const prisma = require("../config/prisma");
const { env } = require("../config/env");

const LIMIT = env.ai.guestSessionLimit;
const WINDOW_HOURS = env.ai.guestWindowHours;

const windowStart = () =>
  new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000);

// Hitung sesi guest yang dimulai dalam window berjalan (rolling 24 jam).
const countGuestSessions = async (guestId) =>
  prisma.guestAiUsage.count({
    where: { guestId, createdAt: { gte: windowStart() } },
  });

// True kalau pasangan (guestId, sessionId) sudah pernah tercatat
// = guest sedang MELANJUTKAN percakapan yang sama (tidak dihitung ulang).
const isExistingSession = async (guestId, sessionId) => {
  const row = await prisma.guestAiUsage.findUnique({
    where: { guestId_sessionId: { guestId, sessionId } },
  });
  return Boolean(row);
};

// Catat sesi baru (idempoten berkat unique constraint).
const recordGuestSession = async (guestId, sessionId) => {
  try {
    await prisma.guestAiUsage.create({ data: { guestId, sessionId } });
  } catch (err) {
    if (err.code !== "P2002") throw err; // P2002 = sudah ada, aman diabaikan
  }
};

module.exports = {
  LIMIT,
  WINDOW_HOURS,
  countGuestSessions,
  isExistingSession,
  recordGuestSession,
};