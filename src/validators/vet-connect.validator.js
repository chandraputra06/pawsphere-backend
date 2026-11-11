const { body } = require("express-validator");

const createConsultationValidator = [
  body("vet_profile_id").trim().notEmpty().withMessage("vet_profile_id is required"),
  body("method")
    .optional({ values: "falsy" })
    .isIn(["chat", "video"])
    .withMessage("method must be 'chat' or 'video'"),
  body("notes")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("notes must be a string")
    .isLength({ max: 5000 })
    .withMessage("notes is too long"),
];

const messageValidator = [
  body("type")
    .optional({ values: "falsy" })
    .isIn(["text", "image", "audio"])
    .withMessage("type must be text, image, or audio"),
  body("content")
    .optional({ values: "falsy" })
    .isString()
    .isLength({ max: 5000 })
    .withMessage("content is too long"),
  body("attachmentUrl")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("attachmentUrl must be a string"),
  body().custom((value) => {
    const hasText = value.content && String(value.content).trim().length > 0;
    const hasAttachment =
      value.attachmentUrl && String(value.attachmentUrl).length > 0;
    if (!hasText && !hasAttachment) {
      throw new Error("Pesan harus berisi teks atau lampiran");
    }
    return true;
  }),
];

const statusValidator = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("status is required")
    .isIn(["active", "completed", "cancelled"])
    .withMessage("status must be active, completed, or cancelled"),
];

module.exports = {
  createConsultationValidator,
  messageValidator,
  statusValidator,
};