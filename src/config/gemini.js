const { env, isGeminiEnabled } = require("./env");

// Lazily create the Gemini client only when an API key is configured.
// If no key is present, this returns null and the AI service falls back
// to the built-in keyword-based triage engine.
let cachedClient = null;

const getGeminiClient = () => {
  if (!isGeminiEnabled) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  // Required lazily so the dependency is only touched when actually used.
  const { GoogleGenAI } = require("@google/genai");

  cachedClient = new GoogleGenAI({ apiKey: env.gemini.apiKey });
  return cachedClient;
};

module.exports = {
  getGeminiClient,
};
