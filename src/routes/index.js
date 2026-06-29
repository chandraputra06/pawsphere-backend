const express = require("express");

const authRoutes = require("./auth.route");
const aiChatRoutes = require("./ai-chat.route");
const vetConnectRoutes = require("./vet-connect.route");
const { authenticate, authorize } = require("../middlewares/auth");
const { successResponse } = require("../utils/response");
const pawAlertRoutes = require("./paw-alert.route");
const adoptionRoutes = require("./adoption.route");
const donationRoutes = require("./donation.route");

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PawSphere API is running",
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

// Module routers
router.use("/auth", authRoutes);
router.use("/ai-chat", aiChatRoutes);
router.use("/vet-connect", vetConnectRoutes);
router.use("/paw-alert", pawAlertRoutes);
router.use("/adoption", adoptionRoutes);
router.use("/donation", donationRoutes);

// ----------------------------------------------------------------
// EXAMPLE: role-protected endpoints.
// These show the standard pattern for "membedakan akses per role":
//   authenticate  -> verifies the JWT and sets req.user (incl. role)
//   authorize(...) -> allows only the listed roles, else 403
//
// The SAME /api/auth/login is used by every role. Differentiation
// happens here, by guarding each route with the roles it permits.
// ----------------------------------------------------------------

// Only admins can reach this.
router.get("/admin/overview", authenticate, authorize("admin"), (req, res) =>
  successResponse(res, 200, "Admin area", {
    message: `Halo ${req.user.email}, kamu masuk sebagai admin.`,
  })
);

// Only verified vets can reach this.
router.get("/vet/inbox", authenticate, authorize("vet"), (req, res) =>
  successResponse(res, 200, "Vet area", {
    message: "Daftar permintaan konsultasi untuk dokter hewan.",
  })
);

// Only shelter managers can reach this.
router.get("/shelter/panel", authenticate, authorize("shelter"), (req, res) =>
  successResponse(res, 200, "Shelter area", {
    message: "Panel manajemen shelter.",
  })
);

module.exports = router;