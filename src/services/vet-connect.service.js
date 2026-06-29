const prisma = require("../config/prisma");
const ApiError = require("../utils/api-error");

const dicebear = (name) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || "vet")}`;

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

// ---------- Browse vets (public) ----------

const mapVetToCard = (vp) => ({
  id: vp.id,
  name: vp.user?.name || "Dokter Hewan",
  specialty: vp.specialization || "Veterinarian",
  avatar: vp.user?.avatarUrl || dicebear(vp.user?.name),
  rating: vp.rating,
  experience: vp.experienceYears,
  location: vp.location || "-",
  price: vp.consultationFee,
  tags: Array.isArray(vp.species) ? vp.species : [],
  isOnline: vp.isAvailable,
  about: vp.about || "",
  sipNumber: vp.sipNumber || null,
  isVerified: vp.isVerified,
});

const listVets = async () => {
  const rows = await prisma.vetProfile.findMany({
    where: { isVerified: true },
    include: { user: true },
    orderBy: [{ isAvailable: "desc" }, { rating: "desc" }],
  });
  return rows.map(mapVetToCard);
};

const getVetById = async (id) => {
  const vp = await prisma.vetProfile.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!vp || !vp.isVerified) throw ApiError.notFound("Dokter tidak ditemukan");
  return mapVetToCard(vp);
};

// ---------- Consultations ----------

const createConsultation = async ({ userId, vetProfileId, method, notes }) => {
  const vet = await prisma.vetProfile.findUnique({ where: { id: vetProfileId } });
  if (!vet || !vet.isVerified) throw ApiError.notFound("Dokter tidak ditemukan");

  return prisma.consultation.create({
    data: {
      vetProfileId,
      userId,
      method: method || "chat",
      status: "pending",
      notes: notes || null,
    },
  });
};

const loadFull = (id) =>
  prisma.consultation.findUnique({
    where: { id },
    include: { vetProfile: { include: { user: true } }, user: true },
  });

const isParticipant = (c, userId) =>
  c && (c.userId === userId || c.vetProfile?.userId === userId);

const listMyConsultations = async (userId) => {
  const rows = await prisma.consultation.findMany({
    where: { userId },
    include: { vetProfile: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((c) => ({
    id: c.id,
    status: c.status,
    method: c.method,
    notes: c.notes,
    created_at: c.createdAt,
    doctor: {
      name: c.vetProfile?.user?.name || "Dokter Hewan",
      specialty: c.vetProfile?.specialization || "Veterinarian",
      avatar: c.vetProfile?.user?.avatarUrl || dicebear(c.vetProfile?.user?.name),
    },
  }));
};

const listVetConsultations = async (vetUserId) => {
  const profile = await prisma.vetProfile.findUnique({ where: { userId: vetUserId } });
  if (!profile) return [];

  const rows = await prisma.consultation.findMany({
    where: { vetProfileId: profile.id },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((c) => ({
    id: c.id,
    status: c.status,
    method: c.method,
    notes: c.notes,
    created_at: c.createdAt,
    patient: {
      name: c.user?.name || "Pengguna",
      avatar: c.user?.avatarUrl || dicebear(c.user?.name),
    },
  }));
};

// ---------- Messages ----------

const listMessages = async (consultationId, viewerId) => {
  const c = await loadFull(consultationId);
  if (!c) throw ApiError.notFound("Konsultasi tidak ditemukan");
  if (!isParticipant(c, viewerId)) throw ApiError.forbidden("Akses ditolak");

  const rows = await prisma.consultationMessage.findMany({
    where: { consultationId },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((m) => ({
    id: m.id,
    text: m.content,
    time: fmtTime(m.createdAt),
    senderId: m.senderId,
    isOwn: m.senderId === viewerId,
  }));
};

const sendMessage = async (consultationId, senderId, content) => {
  const c = await loadFull(consultationId);
  if (!c) throw ApiError.notFound("Konsultasi tidak ditemukan");
  if (!isParticipant(c, senderId)) throw ApiError.forbidden("Akses ditolak");

  const message = await prisma.consultationMessage.create({
    data: { consultationId, senderId, content },
  });

  // When the vet replies to a pending consultation, it becomes active.
  const isVet = c.vetProfile?.userId === senderId;
  if (isVet && c.status === "pending") {
    await prisma.consultation.update({
      where: { id: consultationId },
      data: { status: "active" },
    });
  }

  return {
    id: message.id,
    text: message.content,
    time: fmtTime(message.createdAt),
    senderId,
    isOwn: true,
  };
};

const updateStatus = async (consultationId, vetUserId, status) => {
  const c = await loadFull(consultationId);
  if (!c) throw ApiError.notFound("Konsultasi tidak ditemukan");
  if (c.vetProfile?.userId !== vetUserId) {
    throw ApiError.forbidden("Hanya dokter terkait yang dapat mengubah status");
  }

  return prisma.consultation.update({
    where: { id: consultationId },
    data: { status },
  });
};

module.exports = {
  listVets,
  getVetById,
  createConsultation,
  listMyConsultations,
  listVetConsultations,
  listMessages,
  sendMessage,
  updateStatus,
};