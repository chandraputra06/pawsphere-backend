const { body } = require("express-validator");

const donateValidator = [
  body("amount").notEmpty().withMessage("Nominal wajib diisi").isInt({ min: 1000 }).withMessage("Minimal donasi Rp 1.000"),
  body("name").optional({ values: "falsy" }).isLength({ max: 100 }),
  body("message").optional({ values: "falsy" }).isString(),
  body("is_anonymous").optional().isBoolean(),
];

const campaignValidator = [
  body("title").trim().notEmpty().withMessage("Judul wajib diisi").isLength({ max: 200 }),
  body("description").trim().notEmpty().withMessage("Deskripsi wajib diisi"),
  body("target_amount").notEmpty().withMessage("Target wajib diisi").isInt({ min: 1000 }).withMessage("Target minimal Rp 1.000"),
  body("urgency").optional({ values: "falsy" }).isIn(["normal", "mendesak", "kritis"]).withMessage("urgency tidak valid"),
  body("deadline_days").optional({ values: "falsy" }).isInt({ min: 1, max: 365 }),
  body("image_url").optional({ nullable: true }).isString().isLength({ max: 5000000 }).withMessage("Gambar terlalu besar"),
];

const statusValidator = [
  body("status").trim().notEmpty().isIn(["active", "closed"]).withMessage("status tidak valid"),
];

module.exports = { donateValidator, campaignValidator, statusValidator };