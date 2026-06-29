const { body } = require("express-validator");

const applyValidator = [
  body("animal_id").trim().notEmpty().withMessage("animal_id is required"),
  body("nama").trim().notEmpty().withMessage("Nama wajib diisi").isLength({ max: 100 }),
  body("telepon").trim().notEmpty().withMessage("Telepon wajib diisi").isLength({ max: 20 }),
  body("email").trim().notEmpty().withMessage("Email wajib diisi").isEmail().withMessage("Email tidak valid"),
  body("alamat").trim().notEmpty().withMessage("Alamat wajib diisi"),
  body("pengalaman").optional({ values: "falsy" }).isString(),
  body("alasan").optional({ values: "falsy" }).isString(),
];

const animalValidator = [
  body("name").trim().notEmpty().withMessage("Nama hewan wajib diisi").isLength({ max: 100 }),
  body("species").trim().notEmpty().withMessage("Jenis hewan wajib diisi").isLength({ max: 50 }),
  body("breed").optional({ values: "falsy" }).isLength({ max: 100 }),
  body("age").optional({ values: "falsy" }).isLength({ max: 50 }),
  body("gender").optional({ values: "falsy" }).isLength({ max: 20 }),
  body("description").optional({ values: "falsy" }).isString(),
  body("image_url").optional({ nullable: true }).isString().isLength({ max: 5000000 }).withMessage("Gambar terlalu besar"),
  body("is_vaccinated").optional().isBoolean(),
  body("is_sterilized").optional().isBoolean(),
];

const animalStatusValidator = [
  body("adoption_status").trim().notEmpty().isIn(["available", "pending", "adopted"]).withMessage("status tidak valid"),
];

const appStatusValidator = [
  body("status").trim().notEmpty().isIn(["submitted", "review", "contacted", "survey", "done", "rejected"]).withMessage("status tidak valid"),
];

module.exports = { applyValidator, animalValidator, animalStatusValidator, appStatusValidator };