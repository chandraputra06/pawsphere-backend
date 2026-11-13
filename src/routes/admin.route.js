// src/routes/admin.route.js
const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const { getUsers, patchUserRole } = require("../controllers/admin.controller");

const router = express.Router();

// Semua endpoint di sini hanya untuk admin.
router.use(authenticate, authorize("admin"));

router.get("/users", getUsers);
router.patch("/users/:id/role", patchUserRole);

module.exports = router;