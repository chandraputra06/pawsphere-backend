const app = require("./app");
const prisma = require("./config/prisma");
const { env, isGeminiEnabled } = require("./config/env");

const server = app.listen(env.port, () => {
  console.log("============================================");
  console.log("  PawSphere Backend");
  console.log("============================================");
  console.log(`  Environment : ${env.nodeEnv}`);
  console.log(`  Server      : http://localhost:${env.port}`);
  console.log(`  Health      : http://localhost:${env.port}/api/health`);
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
