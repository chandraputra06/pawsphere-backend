// Wraps an async controller so any thrown error (or rejected promise)
// is forwarded to Express's error-handling middleware via next().
// This lets controllers use async/await without try/catch everywhere.

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
