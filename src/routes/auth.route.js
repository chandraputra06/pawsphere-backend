const express = require("express");

const {
  register,
  login,
  getMe,
} = require("../controllers/auth.controller");
const {
  registerValidator,
  loginValidator,
} = require("../validators/auth.validator");
const validate = require("../middlewares/validate");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", authenticate, getMe);

module.exports = router;
