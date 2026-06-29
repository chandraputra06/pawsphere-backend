const asyncHandler = require("../utils/async-handler");
const { successResponse } = require("../utils/response");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
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

// PATCH /api/auth/me  (requires authentication)
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone_number, avatar_url } = req.body;

  const user = await updateUserProfile(req.user.id, {
    name,
    phoneNumber: phone_number,
    avatarUrl: avatar_url,
  });

  return successResponse(res, 200, "Profile updated successfully", user);
});

// PATCH /api/auth/password  (requires authentication)
const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;

  await changeUserPassword(req.user.id, {
    currentPassword: current_password,
    newPassword: new_password,
  });

  return successResponse(res, 200, "Password updated successfully", null);
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
};