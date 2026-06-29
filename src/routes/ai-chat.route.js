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
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

// All AI Chat Diagnosa endpoints require an authenticated user.
router.post(
  "/triage",
  authenticate,
  createTriageValidator,
  validate,
  createTriage
);
router.post("/chat", authenticate, chatValidator, validate, chatMessage);
router.get("/histories", authenticate, getMyTriageHistories);
router.get("/histories/:id", authenticate, getTriageById);

module.exports = router;