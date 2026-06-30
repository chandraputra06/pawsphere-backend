const express = require("express");
const c = require("../controllers/marketplace.controller");
const { orderValidator } = require("../validators/marketplace.validator");
const validate = require("../middlewares/validate");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.get("/products", c.getProducts);
router.get("/products/:id", c.getProduct);

router.post("/orders", authenticate, orderValidator, validate, c.postOrder);
router.get("/orders/mine", authenticate, c.getMyOrders);

module.exports = router;