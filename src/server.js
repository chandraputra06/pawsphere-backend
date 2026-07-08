const app = require("./app");
const prisma = require("./config/prisma");
const { env, isGeminiEnabled } = require("./config/env");

// Railway menyediakan PORT lewat environment; wajib bind ke 0.0.0.0.
const PORT = process.env.PORT || env.port;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("============================================");
  console.log("  PawSphere Backend");
  console.log("============================================");
  console.log(`  Environment : ${env.nodeEnv}`);
  console.log(`  Server      : listening on port ${PORT}`);
  console.log(`  Health      : /api/health`);
  console.log(
    `  AI Engine   : ${isGeminiEnabled ? "Gemini API" : "Keyword stub (fallback)"}`
  );
  console.log("============================================");
});

// --- Graceful shutdown: close server + DB connections cleanly ---
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Closed server and database connections.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));