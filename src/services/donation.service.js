const prisma = require("../config/prisma");
const ApiError = require("../utils/api-error");

const URGENCY_COLOR = { normal: "bg-green-500", mendesak: "bg-orange-500", kritis: "bg-red-500" };
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const fmtRp = (n) => {
  const v = n || 0;
  if (v >= 1000000) return "Rp " + (v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1) + "jt";
  if (v >= 1000) return "Rp " + Math.round(v / 1000) + "rb";
  return "Rp " + v;
};

const daysLeftOf = (deadline) => {
  if (!deadline) return 0;
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

const mapCampaign = (c) => {
  const raised = c.raisedAmount || 0;
  const target = c.targetAmount || 0;
  const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    image: c.imageUrl || "https://placehold.co/600x400?text=PawSphere",
    urgency: cap(c.urgency),
    urgencyColor: URGENCY_COLOR[c.urgency] || "bg-green-500",
    tags: [],
    shelter: c.shelter?.name || "Shelter",
    progress,
    collected: fmtRp(raised),
    target: fmtRp(target),
    raised_amount: raised,
    target_amount: target,
    donors: c._count?.donations ?? 0,
    daysLeft: daysLeftOf(c.deadline),
    urgent: c.urgency !== "normal",
    status: c.status,
  };
};

const ensureShelter = async (userId) => {
  let shelter = await prisma.shelter.findFirst({ where: { ownerUserId: userId } });
  if (!shelter) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    shelter = await prisma.shelter.create({
      data: {
        ownerUserId: userId,
        name: user?.name || "Shelter PawSphere",
        description: "-",
        address: "-",
        phoneNumber: user?.phoneNumber || "-",
      },
    });
  }
  return shelter;
};

const listCampaigns = async () => {
  const rows = await prisma.donationCampaign.findMany({
    where: { status: "active" },
    include: { shelter: true, _count: { select: { donations: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCampaign);
};

const getCampaignById = async (id) => {
  const c = await prisma.donationCampaign.findUnique({
    where: { id },
    include: { shelter: true, _count: { select: { donations: true } } },
  });
  if (!c) throw ApiError.notFound("Kampanye tidak ditemukan");
  return mapCampaign(c);
};

const donate = async (campaignId, { amount, name, message, isAnonymous, donorUserId }) => {
  const campaign = await prisma.donationCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw ApiError.notFound("Kampanye tidak ditemukan");
  const value = Math.max(0, parseInt(amount, 10) || 0);
  if (value <= 0) throw ApiError.badRequest("Nominal donasi tidak valid");

  await prisma.donation.create({
    data: {
      campaignId,
      donorUserId: donorUserId || null,
      donorName: isAnonymous ? null : name || null,
      type: "money",
      amount: value,
      message: message || null,
      isAnonymous: !!isAnonymous,
    },
  });

  await prisma.donationCampaign.update({
    where: { id: campaignId },
    data: { raisedAmount: { increment: value } },
  });

  return getCampaignById(campaignId);
};

const createCampaign = async (userId, data) => {
  const shelter = await ensureShelter(userId);
  let deadline = null;
  const days = parseInt(data.deadlineDays, 10);
  if (days && days > 0) deadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const c = await prisma.donationCampaign.create({
    data: {
      shelterId: shelter.id,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || null,
      targetAmount: Math.max(0, parseInt(data.targetAmount, 10) || 0),
      urgency: ["normal", "mendesak", "kritis"].includes(data.urgency) ? data.urgency : "normal",
      deadline,
      status: "active",
    },
    include: { shelter: true, _count: { select: { donations: true } } },
  });
  return mapCampaign(c);
};

const listShelterCampaigns = async (userId) => {
  const shelter = await prisma.shelter.findFirst({ where: { ownerUserId: userId } });
  if (!shelter) return [];
  const rows = await prisma.donationCampaign.findMany({
    where: { shelterId: shelter.id },
    include: { shelter: true, _count: { select: { donations: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCampaign);
};

const assertOwns = async (userId, campaignId) => {
  const c = await prisma.donationCampaign.findUnique({ where: { id: campaignId }, include: { shelter: true } });
  if (!c) throw ApiError.notFound("Kampanye tidak ditemukan");
  if (c.shelter?.ownerUserId !== userId) throw ApiError.forbidden("Akses ditolak");
  return c;
};

const updateCampaignStatus = async (userId, campaignId, status) => {
  await assertOwns(userId, campaignId);
  return prisma.donationCampaign.update({ where: { id: campaignId }, data: { status } });
};

const deleteCampaign = async (userId, campaignId) => {
  await assertOwns(userId, campaignId);
  await prisma.donationCampaign.delete({ where: { id: campaignId } });
  return { success: true };
};

module.exports = {
  listCampaigns, getCampaignById, donate,
  createCampaign, listShelterCampaigns, updateCampaignStatus, deleteCampaign,
};