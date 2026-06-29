const { body } = require("express-validator");

const createTriageValidator = [
  body("animal_type")
    .trim()
    .notEmpty()
    .withMessage("Animal type is required")
    .isLength({ max: 50 })
    .withMessage("Animal type must be at most 50 characters long"),

  body("age")
    .trim()
    .notEmpty()
    .withMessage("Age is required")
    .isLength({ max: 50 })
    .withMessage("Age must be at most 50 characters long"),

  body("symptoms")
    .isArray({ min: 1 })
    .withMessage("Symptoms must be a non-empty array"),

  body("symptoms.*")
    .trim()
    .notEmpty()
    .withMessage("Each symptom must be a non-empty string"),

  body("duration")
    .trim()
    .notEmpty()
    .withMessage("Duration is required")
    .isLength({ max: 100 })
    .withMessage("Duration must be at most 100 characters long"),

  body("additional_condition")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Additional condition must be at most 1000 characters long"),
];

const chatValidator = [
  body("messages")
    .isArray({ min: 1 })
    .withMessage("messages must be a non-empty array"),

  body("messages.*.role")
    .trim()
    .notEmpty()
    .withMessage("Each message must have a role"),

  body("messages.*.content")
    .trim()
    .notEmpty()
    .withMessage("Each message must have content"),
];

module.exports = {
  createTriageValidator,
  chatValidator,
};