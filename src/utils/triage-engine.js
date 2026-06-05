// ============================================================
// Keyword-based triage engine (fallback for AI Chat Diagnosa).
// Used when no Gemini API key is configured, or when a Gemini
// call fails. It classifies urgency into green/yellow/red and
// returns first-aid advice + a recommendation, all in Bahasa
// Indonesia to match the platform's audience.
// ============================================================

const RED_KEYWORDS = [
  "kejang",
  "pendarahan",
  "pendarahan berat",
  "tidak sadar",
  "tidak sadarkan diri",
  "sesak napas",
  "sesak nafas",
  "sulit bernapas",
  "sulit bernafas",
  "tertabrak",
  "keracunan",
  "tidak bernapas",
  "pingsan",
  "kolaps",
];

const YELLOW_KEYWORDS = [
  "muntah",
  "muntah berulang",
  "diare",
  "lemas",
  "demam",
  "luka",
  "luka terbuka",
  "tidak mau makan",
  "nafsu makan menurun",
  "batuk",
  "pincang",
  "bengkak",
];

const DISCLAIMER =
  "Hasil ini hanya merupakan triase awal dan bukan diagnosis final. " +
  "Untuk kepastian kondisi hewan, silakan konsultasikan dengan dokter hewan profesional.";

const normalize = (symptoms) =>
  symptoms.map((symptom) => String(symptom).toLowerCase().trim());

const determineUrgencyLevel = (symptoms) => {
  const normalized = normalize(symptoms);

  const hasRed = normalized.some((symptom) =>
    RED_KEYWORDS.some((keyword) => symptom.includes(keyword))
  );
  if (hasRed) return "red";

  const hasYellow = normalized.some((symptom) =>
    YELLOW_KEYWORDS.some((keyword) => symptom.includes(keyword))
  );
  if (hasYellow) return "yellow";

  return "green";
};

const generateFirstAidAdvice = (urgencyLevel) => {
  if (urgencyLevel === "red") {
    return [
      "Segera bawa hewan ke dokter hewan atau layanan darurat terdekat.",
      "Jangan memberikan obat manusia tanpa arahan dokter hewan.",
      "Jaga hewan tetap tenang, hangat, dan aman selama perjalanan.",
    ];
  }

  if (urgencyLevel === "yellow") {
    return [
      "Pantau kondisi hewan secara berkala dan catat perubahan gejala.",
      "Pastikan hewan tetap terhidrasi dan beristirahat.",
      "Segera konsultasi dengan dokter hewan jika gejala memburuk dalam beberapa jam.",
    ];
  }

  return [
    "Pantau kondisi hewan selama 24 jam ke depan.",
    "Berikan makanan dan minuman seperti biasa jika hewan masih mau makan.",
    "Gunakan fitur konsultasi jika muncul gejala tambahan.",
  ];
};

const generateRecommendation = (urgencyLevel) => {
  if (urgencyLevel === "red") {
    return "Kondisi darurat. Gunakan Paw Alert atau segera hubungi dokter hewan melalui Vet Connect.";
  }

  if (urgencyLevel === "yellow") {
    return "Disarankan melanjutkan ke Vet Connect untuk konsultasi dengan dokter hewan.";
  }

  return "Kondisi terlihat ringan, tetapi tetap lakukan pemantauan secara berkala.";
};

const buildSummary = ({ animalType, symptoms, duration, age }) => {
  const symptomText = symptoms.join(", ");
  const ageText = age ? ` berusia ${age}` : "";
  return `${animalType}${ageText} mengalami gejala ${symptomText} dengan durasi ${duration}.`;
};

// Produces the full triage result object from raw input.
const runStubTriage = ({
  animalType,
  age,
  symptoms,
  duration,
  additionalCondition,
}) => {
  const urgencyLevel = determineUrgencyLevel(symptoms);

  return {
    urgencyLevel,
    summary: buildSummary({ animalType, symptoms, duration, age }),
    firstAidAdvice: generateFirstAidAdvice(urgencyLevel),
    recommendation: generateRecommendation(urgencyLevel),
    disclaimer: DISCLAIMER,
    source: "stub",
  };
};

module.exports = {
  runStubTriage,
  determineUrgencyLevel,
  DISCLAIMER,
};
