const express = require("express");
const c = require("../controllers/donation.controller");
const { donateValidator, campaignValidator, statusValidator } = require("../validators/donation.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");

const router = express.Router();

router.get("/campaigns", c.getCampaigns);

router.post("/campaigns", authenticate, authorize("shelter"), campaignValidator, validate, c.postCampaign);
router.get("/shelter/campaigns", authenticate, authorize("shelter"), c.getShelterCampaigns);
router.patch("/campaigns/:id/status", authenticate, authorize("shelter"), statusValidator, validate, c.patchCampaignStatus);
router.delete("/campaigns/:id", authenticate, authorize("shelter"), c.removeCampaign);

router.post("/campaigns/:id/donate", donateValidator, validate, c.postDonation);

router.get("/campaigns/:id", c.getCampaign);

module.exports = router;