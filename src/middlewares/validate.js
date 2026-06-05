const { validationResult } = require("express-validator");
const { errorResponse } = require("../utils/response");

// Runs after a chain of express-validator rules. If any rule failed,
// it returns the standard validation-error envelope (matching the
// API contract: type "field" entries with value/msg/path/location).
const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((err) => ({
    type: err.type || "field",
    value: err.value,
    msg: err.msg,
    path: err.path,
    location: err.location,
  }));

  return errorResponse(res, 400, "Validation error", "validation-error", errors);
};

module.exports = validate;
