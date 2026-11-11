const { errorResponse } = require("../utils/response");
const {
  LIMIT,
  countGuestSessions,
  isExistingSession,
  recordGuestSession,
} = require("../services/guest-ai.service");

// Meter AI chat untuk GUEST. User login lewat tanpa dibatasi (unlimited).
// 1 sesi = 1 percakapan (header X-Session-Id). Guest boleh mulai LIMIT sesi
// baru per window; sesi baru ke-(LIMIT+1) diblok 403.
const guestAiMeter = async (req, res, next) => {
  if (req.user) {
    res.locals.aiGuest = null; // login -> unlimited
    return next();
  }

  const guestId = (req.headers["x-guest-id"] || "").toString().trim();
  const sessionId = (req.headers["x-session-id"] || "").toString().trim();

  if (!guestId || !sessionId) {
    return errorResponse(
      res,
      400,
      "Identitas guest diperlukan untuk AI chat tanpa login",
      "guest_identity_required"
    );
  }

  try {
    // Melanjutkan percakapan yang sudah dihitung: selalu diizinkan.
    if (await isExistingSession(guestId, sessionId)) {
      const used = await countGuestSessions(guestId);
      res.locals.aiGuest = {
        limit: LIMIT,
        used,
        remaining: Math.max(0, LIMIT - used),
      };
      return next();
    }

    // Percakapan baru: tegakkan batas.
    const used = await countGuestSessions(guestId);
    if (used >= LIMIT) {
      return errorResponse(
        res,
        403,
        `Anda telah mencapai batas ${LIMIT} sesi gratis. Silakan masuk untuk melanjutkan tanpa batas.`,
        "guest_limit_reached"
      );
    }

    await recordGuestSession(guestId, sessionId);
    const newUsed = used + 1;
    res.locals.aiGuest = {
      limit: LIMIT,
      used: newUsed,
      remaining: Math.max(0, LIMIT - newUsed),
    };
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { guestAiMeter };