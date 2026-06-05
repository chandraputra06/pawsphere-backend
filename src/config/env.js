require("dotenv").config();

const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  databaseUrl: process.env.DATABASE_URL,

  jwt: {
    secret: process.env.JWT_SECRET || "insecure-dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  },

  corsOrigin: process.env.CORS_ORIGIN || "*",
};

const isGeminiEnabled = Boolean(env.gemini.apiKey && env.gemini.apiKey.trim());

module.exports = {
  env,
  isGeminiEnabled,
};
