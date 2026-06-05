const { Prisma } = require("@prisma/client");
const ApiError = require("../utils/api-error");
const { errorResponse } = require("../utils/response");
const { env } = require("../config/env");

// Central error handler. Must be registered LAST, after all routes.
// Express recognizes it as an error handler because it takes 4 args.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // 1) Our own typed errors
  if (err instanceof ApiError) {
    return errorResponse(
      res,
      err.statusCode,
      err.message,
      err.type,
      err.errors
    );
  }

  // 2) Known Prisma request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint failed
    if (err.code === "P2002") {
      const fields = err.meta && err.meta.target ? err.meta.target : [];
      const fieldLabel = Array.isArray(fields) ? fields.join(", ") : fields;
      return errorResponse(
        res,
        409,
        `A record with this ${fieldLabel} already exists`,
        "conflict-error"
      );
    }

    // Record not found (e.g. update/delete on missing row)
    if (err.code === "P2025") {
      return errorResponse(res, 404, "Resource not found", "not-found");
    }

    // Foreign key constraint failed
    if (err.code === "P2003") {
      return errorResponse(
        res,
        400,
        "Related record does not exist",
        "bad-request"
      );
    }
  }

  // 3) Invalid JSON body (from express.json())
  if (err.type === "entity.parse.failed") {
    return errorResponse(
      res,
      400,
      "Invalid JSON in request body",
      "bad-request"
    );
  }

  // 4) Fallback: unexpected internal error
  // Log full error server-side; never leak internals to the client.
  console.error("[Unhandled Error]", err);

  const message =
    env.nodeEnv === "development" ? err.message : "Internal Server Error";

  return errorResponse(res, 500, message, "internal-server-error");
};

module.exports = errorHandler;
