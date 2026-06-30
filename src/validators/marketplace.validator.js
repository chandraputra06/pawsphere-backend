const { body } = require("express-validator");

const orderValidator = [
  body("items").isArray({ min: 1 }).withMessage("Keranjang kosong"),
  body("items.*.product_id").trim().notEmpty().withMessage("product_id wajib"),
  body("items.*.quantity").optional().isInt({ min: 1 }),
  body("shipping_address").optional({ values: "falsy" }).isString(),
  body("payment_method").optional({ values: "falsy" }).isString(),
];

module.exports = { orderValidator };