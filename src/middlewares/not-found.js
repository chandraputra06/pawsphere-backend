const { errorResponse } = require("../utils/response");

// Catches any request that did not match a defined route.
const notFoundHandler = (req, res) => {
  return errorResponse(
    res,
    404,
    `Route not found: ${req.method} ${req.originalUrl}`,
    "not-found"
  );
};

module.exports = notFoundHandler;
