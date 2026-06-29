const { body } = require("express-validator");

const createReportValidator = [
  body("animal_type")
    .optional({ values: "falsy" })
    .isString()
    .isLength({ max: 50 })
    .withMessage("animal_type is too long"),
  body("condition")
    .optional({ values: "falsy" })
    .isString()
    .isLength({ max: 100 })
    .withMessage("condition is too long"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("description is required")
    .isLength({ max: 5000 })
    .withMessage("description is too long"),
  body("photo_url")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 5000000 })
    .withMessage("photo is too large"),
  body("latitude").optional({ nullable: true }).isFloat().withMessage("latitude must be a number"),
  body("longitude").optional({ nullable: true }).isFloat().withMessage("longitude must be a number"),
];

const statusValidator = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("status is required")
    .isIn(["open", "responding", "resolved"])
    .withMessage("status must be open, responding, or resolved"),
];

module.exports = { createReportValidator, statusValidator };