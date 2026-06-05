// A typed error that carries an HTTP status code, an error "type"
// string (matching the API contract vocabulary), and optional
// structured field errors. Services throw these and the central
// error handler converts them into the standard error envelope.

class ApiError extends Error {
  constructor(statusCode, message, type = "error", errors = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.type = type;
    this.errors = errors;
  }

  static badRequest(message, errors = []) {
    return new ApiError(400, message, "bad-request", errors);
  }

  static validation(message = "Validation error", errors = []) {
    return new ApiError(400, message, "validation-error", errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message, "unauthorized");
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message, "forbidden");
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message, "not-found");
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message, "conflict-error");
  }

  static internal(message = "Internal Server Error") {
    return new ApiError(500, message, "internal-server-error");
  }
}

module.exports = ApiError;
