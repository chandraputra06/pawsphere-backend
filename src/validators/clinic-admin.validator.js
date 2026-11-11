const { body } = require("express-validator");

const statusValidator = [
  body("status")
    .trim()
    .notEmpty().withMessage("status is required")
    .isIn(["pending", "confirmed", "completed", "cancelled"])
    .withMessage("status must be pending, confirmed, completed, or cancelled"),
];

module.exports = { statusValidator };