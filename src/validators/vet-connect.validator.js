const { body } = require("express-validator");

const createConsultationValidator = [
  body("vet_profile_id").trim().notEmpty().withMessage("vet_profile_id is required"),
  body("method")
    .optional({ values: "falsy" })
    .isIn(["chat", "video"])
    .withMessage("method must be 'chat' or 'video'"),
  body("notes")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("notes must be a string")
    .isLength({ max: 5000 })
    .withMessage("notes is too long"),
];

const messageValidator = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("content is required")
    .isLength({ max: 5000 })
    .withMessage("content is too long"),
];

const statusValidator = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("status is required")
    .isIn(["active", "completed", "cancelled"])
    .withMessage("status must be active, completed, or cancelled"),
];

module.exports = {
  createConsultationValidator,
  messageValidator,
  statusValidator,
};