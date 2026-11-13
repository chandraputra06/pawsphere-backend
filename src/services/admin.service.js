// src/services/admin.service.js
const prisma = require("../config/prisma");
const ApiError = require("../utils/api-error");

const VALID_ROLES = ["user", "vet", "shelter", "klinik", "admin"];

const mapUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
});

// Semua pengguna (khusus admin), terbaru di atas.
const listUsers = async () => {
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapUser);
};

// Ubah role seorang pengguna. Admin tidak boleh mengubah role akun sendiri.
const updateUserRole = async (actingAdminId, userId, role) => {
  if (!VALID_ROLES.includes(role)) {
    throw ApiError.badRequest("Role tidak valid");
  }
  if (actingAdminId === userId) {
    throw ApiError.badRequest("Tidak dapat mengubah role akun sendiri");
  }
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw ApiError.notFound("Pengguna tidak ditemukan");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  return mapUser(updated);
};

module.exports = { listUsers, updateUserRole };