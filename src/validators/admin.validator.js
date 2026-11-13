// src/validators/admin.validator.js
const { body } = require("express-validator");

const roleValidator = [
  body("role")
    .exists({ checkFalsy: true })
    .withMessage("Role wajib diisi")
    .bail()
    .isIn(["user", "vet", "shelter", "klinik", "admin"])
    .withMessage("Role tidak valid"),
];

module.exports = { roleValidator };