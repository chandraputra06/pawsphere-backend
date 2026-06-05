const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { errorResponse } = require("../utils/response");

// Verifies the Bearer token from the Authorization header and attaches
// the decoded payload to req.user. Rejects missing/invalid/expired tokens.
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return errorResponse(
      res,
      401,
      "Authentication token is required",
      "unauthorized"
    );
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return errorResponse(
      res,
      401,
      "Authentication token is required",
      "unauthorized"
    );
  }

  try {
    const decoded = jwt.verify(token, env.jwt.secret);
    // decoded carries: { id, email, role }
    req.user = decoded;
    return next();
  } catch (error) {
    return errorResponse(
      res,
      401,
      "Invalid or expired authentication token",
      "unauthorized"
    );
  }
};

// Restricts a route to one or more roles. Must run AFTER authenticate.
// Usage: router.get("/admin", authenticate, authorize("admin"), handler)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized", "unauthorized");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        "You do not have permission to access this resource",
        "forbidden"
      );
    }

    return next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
