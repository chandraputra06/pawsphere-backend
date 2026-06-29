const asyncHandler = require("../utils/async-handler");
const { successResponse } = require("../utils/response");
const svc = require("../services/donation.service");

const getCampaigns = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Campaigns retrieved", await svc.listCampaigns());
});
const getCampaign = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Campaign retrieved", await svc.getCampaignById(req.params.id));
});
const postDonation = asyncHandler(async (req, res) => {
  const { amount, name, message, is_anonymous } = req.body;
  const updated = await svc.donate(req.params.id, {
    amount, name, message, isAnonymous: is_anonymous,
    donorUserId: req.user ? req.user.id : null,
  });
  return successResponse(res, 201, "Donation received", updated);
});

const postCampaign = asyncHandler(async (req, res) => {
  const b = req.body;
  const c = await svc.createCampaign(req.user.id, {
    title: b.title, description: b.description, imageUrl: b.image_url,
    targetAmount: b.target_amount, urgency: b.urgency, deadlineDays: b.deadline_days,
  });
  return successResponse(res, 201, "Campaign created", c);
});
const getShelterCampaigns = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Campaigns retrieved", await svc.listShelterCampaigns(req.user.id));
});
const patchCampaignStatus = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Campaign updated", await svc.updateCampaignStatus(req.user.id, req.params.id, req.body.status));
});
const removeCampaign = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Campaign deleted", await svc.deleteCampaign(req.user.id, req.params.id));
});

module.exports = {
  getCampaigns, getCampaign, postDonation,
  postCampaign, getShelterCampaigns, patchCampaignStatus, removeCampaign,
};