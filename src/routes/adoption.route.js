const express = require("express");
const c = require("../controllers/adoption.controller");
const {
  applyValidator, animalValidator, animalStatusValidator, appStatusValidator,
} = require("../validators/adoption.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");

const router = express.Router();

router.get("/animals", c.getAnimals);

router.post("/animals", authenticate, authorize("shelter"), animalValidator, validate, c.postAnimal);
router.get("/shelter/animals", authenticate, authorize("shelter"), c.getShelterAnimals);
router.get("/shelter/applications", authenticate, authorize("shelter"), c.getShelterApplications);
router.patch("/applications/:id/status", authenticate, authorize("shelter"), appStatusValidator, validate, c.patchApplicationStatus);
router.patch("/animals/:id/status", authenticate, authorize("shelter"), animalStatusValidator, validate, c.patchAnimal);
router.patch("/animals/:id", authenticate, authorize("shelter"), c.patchAnimal);
router.delete("/animals/:id", authenticate, authorize("shelter"), c.removeAnimal);

router.post("/applications", authenticate, applyValidator, validate, c.postApplication);
router.get("/applications/mine", authenticate, c.getMyApplications);

router.get("/animals/:id", c.getAnimal);

module.exports = router;