const express = require("express");

const {
  createTriage,
  getMyTriageHistories,
  getTriageById,
  chatMessage,
} = require("../controllers/ai-chat.controller");
const {
  createTriageValidator,
  chatValidator,
} = require("../validators/ai-chat.validator");
const validate = require("../middlewares/validate");
const { authenticate, optionalAuthenticate } = require("../middlewares/auth");
const { guestAiMeter } = require("../middlewares/guest-ai-meter");

const router = express.Router();

// Triage & histories: wajib login.
router.post(
  "/triage",
  authenticate,
  createTriageValidator,
  validate,
  createTriage
);
router.get("/histories", authenticate, getMyTriageHistories);
router.get("/histories/:id", authenticate, getTriageById);

// Chat: guest boleh 5 sesi (di-meter), user login unlimited.
router.post(
  "/chat",
  optionalAuthenticate,
  chatValidator,
  validate,
  guestAiMeter,
  chatMessage
);

module.exports = router;