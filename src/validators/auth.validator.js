const { body } = require("express-validator");

const VALID_ROLES = ["user", "vet", "shelter", "admin"];

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters long"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 100 })
    .withMessage("Password must be at least 6 characters long"),

  body("phone_number")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Phone number must be between 8 and 20 characters long"),

  body("role")
    .optional({ values: "falsy" })
    .isIn(VALID_ROLES)
    .withMessage(`Role must be one of: ${VALID_ROLES.join(", ")}`),
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  registerValidator,
  loginValidator,
};
