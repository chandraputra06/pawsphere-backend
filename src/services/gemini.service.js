// ============================================================
// Gemini-powered triage + chat.
// - Retries on transient 503/429/overload with exponential backoff.
// - Falls back through a chain of models if one is unavailable.
// - Triage: gracefully drops to the keyword stub if all fail.
// - Chat: returns a friendly message if all fail.
// ============================================================

const { getGeminiClient } = require("../config/gemini");
const { env } = require("../config/env");
const { runStubTriage, DISCLAIMER } = require("../utils/triage-engine");

const VALID_URGENCY = ["green", "yellow", "red"];

// Model fallback chain. Starts with the configured model, then tries
// progressively lighter/alternative models that tend to have spare capacity.
const MODEL_CHAIN = [
  ...new Set([
    env.gemini.model,
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
  ]),
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isRetryable = (error) => {
  const status = error?.status || error?.code;
  const msg = String(error?.message || "").toLowerCase();
  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    msg.includes("unavailable") ||
    msg.includes("overloaded") ||
    msg.includes("high demand")
  );
};

// Calls generateContent, retrying each model up to `retries` times with
// backoff, then moving to the next model in the chain.
const generateWithFallback = async (baseParams, { retries = 3 } = {}) => {
  const client = getGeminiClient();
  let lastError;

  for (const model of MODEL_CHAIN) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await client.models.generateContent({ ...baseParams, model });
      } catch (error) {
        lastError = error;
        if (isRetryable(error) && attempt < retries) {
          // wait 1s, 2s, 4s ...
          await sleep(1000 * 2 ** (attempt - 1));
          continue;
        }
        // Not retryable, or out of attempts for this model -> try next model.
        break;
      }
    }
  }

  throw lastError || new Error("Gemini request failed");
};

// ---------------- Triage (structured) ----------------

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

const buildUserPrompt = ({ animalType, age, symptoms, duration, additionalCondition }) => {
  return `Data hewan:
- Jenis hewan: ${animalType}
- Usia: ${age}
- Gejala: ${symptoms.join(", ")}
- Durasi gejala: ${duration}
- Kondisi tambahan: ${additionalCondition || "tidak ada"}

Berikan triase awal dalam format JSON sesuai instruksi.`;
};

const stripCodeFences = (text) =>
  text.replace(/```json/gi, "").replace(/```/g, "").trim();

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

const generateTriage = async (input) => {
  const client = getGeminiClient();
  if (!client) return runStubTriage(input);

  try {
    const response = await generateWithFallback({
      contents: buildUserPrompt(input),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const rawText =
      typeof response.text === "string" ? response.text : String(response.text || "");
    const parsed = JSON.parse(stripCodeFences(rawText));
    const normalized = normalizeGeminiResult(parsed, input);

    return normalized || runStubTriage(input);
  } catch (error) {
    console.error("[Gemini] Triage failed, falling back to stub:", error.message);
    return runStubTriage(input);
  }
};

// ---------------- Chat (free-form) ----------------

const CHAT_SYSTEM_INSTRUCTION = `Kamu adalah "PawSphere AI", asisten triase kesehatan hewan pada platform PawSphere.
Gaya bicara: Bahasa Indonesia, ramah, menenangkan, dan ringkas (beberapa kalimat saja, boleh pakai poin singkat).

Tugas & aturan:
- Bantu pemilik hewan memahami kemungkinan penyebab gejala dan beri saran pertolongan pertama yang aman.
- Jika gejala terdengar serius atau darurat, sampaikan tingkat urgensinya dan sarankan segera menghubungi dokter hewan lewat fitur Vet Connect (atau Paw Alert untuk kondisi darurat).
- JANGAN pernah memberi dosis atau nama obat keras. Tegaskan bahwa ini hanya triase awal, bukan diagnosis final dari dokter hewan.
- Jika pertanyaan di luar topik kesehatan/kesejahteraan hewan, arahkan kembali dengan sopan.`;

const generateChatReply = async ({ messages }) => {
  const client = getGeminiClient();

  if (!client) {
    return {
      reply:
        "Maaf, layanan AI sedang tidak aktif (API key Gemini belum dikonfigurasi). " +
        "Untuk sementara, kamu bisa menggunakan fitur Vet Connect untuk berkonsultasi langsung dengan dokter hewan.",
      source: "offline",
    };
  }

  try {
    const contents = messages.slice(-20).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: String(m.content || "") }],
    }));

    const response = await generateWithFallback({
      contents,
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        temperature: 0.6,
      },
    });

    const text =
      typeof response.text === "string" ? response.text : String(response.text || "");

    return {
      reply: text.trim() || "Maaf, aku belum bisa memproses itu. Coba jelaskan lagi ya. 🐾",
      source: "gemini",
    };
  } catch (error) {
    console.error("[Gemini] Chat failed:", error.message);
    return {
      reply:
        "Maaf, server AI sedang sangat sibuk (high demand) dan belum bisa menjawab sekarang. " +
        "Coba lagi beberapa saat lagi, atau gunakan fitur Vet Connect untuk konsultasi langsung dengan dokter hewan.",
      source: "error",
    };
  }
};

module.exports = {
  generateTriage,
  generateChatReply,
};