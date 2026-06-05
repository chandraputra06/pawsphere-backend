const express = require("express");

const authRoutes = require("./auth.route");
const aiChatRoutes = require("./ai-chat.route");

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

// ----------------------------------------------------------------
// Future modules plug in here as they are implemented:
//   router.use("/vet-connect", vetConnectRoutes);
//   router.use("/marketplace", marketplaceRoutes);
//   router.use("/paw-alert", pawAlertRoutes);
//   router.use("/shelters", shelterRoutes);
//   router.use("/adoptions", adoptionRoutes);
//   router.use("/donations", donationRoutes);
// ----------------------------------------------------------------

module.exports = router;
