const express = require("express");

const {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
} = require("../controllers/auth.controller");
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} = require("../validators/auth.validator");
const validate = require("../middlewares/validate");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateProfileValidator, validate, updateMe);
router.patch(
  "/password",
  authenticate,
  changePasswordValidator,
  validate,
  changePassword
);

module.exports = router;