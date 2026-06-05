// Standard success/error response envelope.
// Matches the shape used across the API contract:
//   success: { success, message, data }
//   error:   { success, message, type, errors }

const successResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode, message, type, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    type,
    errors,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
