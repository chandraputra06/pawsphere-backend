// ============================================================
// Gemini-powered triage. Builds a structured prompt, requests
// strict JSON, validates the response, and gracefully falls
// back to the keyword stub on any error or when Gemini is off.
// ============================================================

const { getGeminiClient } = require("../config/gemini");
const { env } = require("../config/env");
const { runStubTriage, DISCLAIMER } = require("../utils/triage-engine");

const VALID_URGENCY = ["green", "yellow", "red"];

// System instruction constrains Gemini to safe veterinary triage only.
const SYSTEM_INSTRUCTION = `Kamu adalah asisten triase kesehatan hewan untuk platform PawSphere.
Tugasmu HANYA memberikan triase awal (bukan diagnosis final) berdasarkan gejala yang dilaporkan pemilik hewan.

Aturan ketat:
- Klasifikasikan urgensi ke dalam salah satu dari: "green" (ringan, pantau di rumah), "yellow" (perlu konsultasi dokter hewan), "red" (darurat, butuh penanganan segera).
- Jangan pernah memberikan dosis atau nama obat keras. Jangan menggantikan diagnosis dokter hewan.
- Gunakan Bahasa Indonesia yang jelas dan menenangkan.
- Jawab HANYA dalam format JSON valid tanpa teks tambahan, tanpa markdown, tanpa code fence.

Format JSON yang WAJIB:
{
  "urgency_level": "green" | "yellow" | "red",
  "summary": "ringkasan singkat kondisi hewan",
  "first_aid_advice": ["saran 1", "saran 2", "saran 3"],
  "recommendation": "rekomendasi langkah selanjutnya"
}`;

const buildUserPrompt = ({
  animalType,
  age,
  symptoms,
  duration,
  additionalCondition,
}) => {
  return `Data hewan:
- Jenis hewan: ${animalType}
- Usia: ${age}
- Gejala: ${symptoms.join(", ")}
- Durasi gejala: ${duration}
- Kondisi tambahan: ${additionalCondition || "tidak ada"}

Berikan triase awal dalam format JSON sesuai instruksi.`;
};

// Strips ```json fences if the model wraps its output despite instructions.
const stripCodeFences = (text) => {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
};

// Validates and normalizes Gemini's parsed JSON into our result shape.
// Returns null if the shape is unusable (caller falls back to stub).
const normalizeGeminiResult = (parsed, input) => {
  if (!parsed || typeof parsed !== "object") return null;

  const urgency = String(parsed.urgency_level || "").toLowerCase();
  if (!VALID_URGENCY.includes(urgency)) return null;

  const firstAid = Array.isArray(parsed.first_aid_advice)
    ? parsed.first_aid_advice.map((item) => String(item)).filter(Boolean)
    : [];

  if (firstAid.length === 0) return null;

  const summary =
    typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim()
      : `${input.animalType} mengalami gejala ${input.symptoms.join(", ")}.`;

  const recommendation =
    typeof parsed.recommendation === "string" && parsed.recommendation.trim()
      ? parsed.recommendation.trim()
      : "Pantau kondisi hewan dan konsultasikan ke dokter hewan bila perlu.";

  return {
    urgencyLevel: urgency,
    summary,
    firstAidAdvice: firstAid,
    recommendation,
    disclaimer: DISCLAIMER,
    source: "gemini",
  };
};

// Main entry: tries Gemini, falls back to the stub on any problem.
const generateTriage = async (input) => {
  const client = getGeminiClient();

  // No API key configured -> use the stub directly.
  if (!client) {
    return runStubTriage(input);
  }

  try {
    const response = await client.models.generateContent({
      model: env.gemini.model,
      contents: buildUserPrompt(input),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const rawText =
      typeof response.text === "string" ? response.text : String(response.text || "");

    const cleaned = stripCodeFences(rawText);
    const parsed = JSON.parse(cleaned);

    const normalized = normalizeGeminiResult(parsed, input);

    if (!normalized) {
      // Shape was unusable; fall back to stub.
      return runStubTriage(input);
    }

    return normalized;
  } catch (error) {
    // Any failure (network, quota, bad JSON) -> safe fallback.
    console.error("[Gemini] Triage failed, falling back to stub:", error.message);
    return runStubTriage(input);
  }
};

module.exports = {
  generateTriage,
};
