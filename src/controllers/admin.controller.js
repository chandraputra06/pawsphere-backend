// src/controllers/admin.controller.js
const adminService = require("../services/admin.service");
const { successResponse } = require("../utils/response");

const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.listUsers();
    return successResponse(res, 200, "Daftar pengguna", users);
  } catch (err) {
    next(err);
  }
};

const patchUserRole = async (req, res, next) => {
  try {
    const user = await adminService.updateUserRole(
      req.user.id,
      req.params.id,
      req.body.role
    );
    return successResponse(res, 200, "Role pengguna berhasil diperbarui", user);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, patchUserRole };