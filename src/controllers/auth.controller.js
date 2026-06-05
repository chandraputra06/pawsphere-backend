const asyncHandler = require("../utils/async-handler");
const { successResponse } = require("../utils/response");
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../services/auth.service");

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone_number, role } = req.body;

  const result = await registerUser({
    name,
    email,
    password,
    phoneNumber: phone_number,
    role,
  });

  return successResponse(res, 201, "User registered successfully", result);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUser({ email, password });

  return successResponse(res, 200, "Login successful", result);
});

// GET /api/auth/me  (requires authentication)
const getMe = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);

  return successResponse(res, 200, "Profile retrieved successfully", user);
});

module.exports = {
  register,
  login,
  getMe,
};
