const asyncHandler = require("../utils/async-handler");
const { successResponse } = require("../utils/response");
const svc = require("../services/adoption.service");

const getAnimals = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Animals retrieved", await svc.listAnimals());
});
const getAnimal = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Animal retrieved", await svc.getAnimalById(req.params.id));
});

const postApplication = asyncHandler(async (req, res) => {
  const { animal_id, nama, telepon, email, alamat, pengalaman, alasan } = req.body;
  const app = await svc.applyAdoption({
    animalId: animal_id, applicantUserId: req.user.id,
    fullName: nama, phoneNumber: telepon, email, address: alamat,
    experience: pengalaman, reason: alasan,
  });
  return successResponse(res, 201, "Application submitted", app);
});
const getMyApplications = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Applications retrieved", await svc.listMyApplications(req.user.id));
});

const postAnimal = asyncHandler(async (req, res) => {
  const b = req.body;
  const animal = await svc.createAnimal(req.user.id, {
    name: b.name, species: b.species, breed: b.breed, age: b.age, gender: b.gender,
    description: b.description, imageUrl: b.image_url,
    isVaccinated: b.is_vaccinated, isSterilized: b.is_sterilized,
  });
  return successResponse(res, 201, "Animal created", animal);
});
const getShelterAnimals = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Animals retrieved", await svc.listShelterAnimals(req.user.id));
});
const patchAnimal = asyncHandler(async (req, res) => {
  const b = req.body;
  const animal = await svc.updateAnimal(req.user.id, req.params.id, {
    name: b.name, species: b.species, breed: b.breed, age: b.age, gender: b.gender,
    description: b.description, imageUrl: b.image_url,
    isVaccinated: b.is_vaccinated, isSterilized: b.is_sterilized, adoptionStatus: b.adoption_status,
  });
  return successResponse(res, 200, "Animal updated", animal);
});
const removeAnimal = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Animal deleted", await svc.deleteAnimal(req.user.id, req.params.id));
});
const getShelterApplications = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Applications retrieved", await svc.listShelterApplications(req.user.id));
});
const patchApplicationStatus = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Application updated", await svc.updateApplicationStatus(req.user.id, req.params.id, req.body.status));
});

module.exports = {
  getAnimals, getAnimal, postApplication, getMyApplications,
  postAnimal, getShelterAnimals, patchAnimal, removeAnimal,
  getShelterApplications, patchApplicationStatus,
};