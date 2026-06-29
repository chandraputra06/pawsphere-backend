const prisma = require("../config/prisma");
const ApiError = require("../utils/api-error");

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const buildTags = (a) => {
  const tags = [];
  if (a.isVaccinated) tags.push("Vaksin");
  if (a.isSterilized) tags.push("Steril");
  tags.push("Sehat");
  return tags;
};

const mapAnimal = (a) => ({
  id: a.id,
  name: a.name,
  type: cap(a.species),
  breed: a.breed || "-",
  age: a.age || "-",
  gender: a.gender || "-",
  location: a.shelter?.address || "-",
  tags: buildTags(a),
  shelter: a.shelter?.name || "Shelter",
  image: a.imageUrl || "https://placehold.co/500x400?text=PawSphere",
  description: a.description || "",
  adoption_status: a.adoptionStatus,
});

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

const listAnimals = async () => {
  const rows = await prisma.animal.findMany({
    where: { adoptionStatus: "available" },
    include: { shelter: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapAnimal);
};

const getAnimalById = async (id) => {
  const a = await prisma.animal.findUnique({ where: { id }, include: { shelter: true } });
  if (!a) throw ApiError.notFound("Hewan tidak ditemukan");
  return mapAnimal(a);
};

const applyAdoption = async ({ animalId, applicantUserId, fullName, phoneNumber, email, address, experience, reason }) => {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) throw ApiError.notFound("Hewan tidak ditemukan");

  return prisma.adoptionApplication.create({
    data: {
      animalId, applicantUserId, fullName, phoneNumber, email, address,
      experience: experience || null, reason: reason || null, status: "submitted",
    },
  });
};

const listMyApplications = async (userId) => {
  const rows = await prisma.adoptionApplication.findMany({
    where: { applicantUserId: userId },
    include: { animal: { include: { shelter: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((app) => ({
    id: app.id,
    status: app.status,
    created_at: app.createdAt,
    animal: { name: app.animal?.name, type: cap(app.animal?.species), image: app.animal?.imageUrl || null },
  }));
};

const createAnimal = async (userId, data) => {
  const shelter = await ensureShelter(userId);
  const animal = await prisma.animal.create({
    data: {
      shelterId: shelter.id,
      name: data.name,
      species: (data.species || "").toLowerCase(),
      breed: data.breed || null,
      age: data.age || null,
      gender: data.gender || null,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      isVaccinated: !!data.isVaccinated,
      isSterilized: !!data.isSterilized,
      adoptionStatus: "available",
    },
    include: { shelter: true },
  });
  return mapAnimal(animal);
};

const listShelterAnimals = async (userId) => {
  const shelter = await prisma.shelter.findFirst({ where: { ownerUserId: userId } });
  if (!shelter) return [];
  const rows = await prisma.animal.findMany({
    where: { shelterId: shelter.id },
    include: { shelter: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapAnimal);
};

const assertOwnsAnimal = async (userId, animalId) => {
  const animal = await prisma.animal.findUnique({ where: { id: animalId }, include: { shelter: true } });
  if (!animal) throw ApiError.notFound("Hewan tidak ditemukan");
  if (animal.shelter?.ownerUserId !== userId) throw ApiError.forbidden("Akses ditolak");
  return animal;
};

const updateAnimal = async (userId, animalId, data) => {
  await assertOwnsAnimal(userId, animalId);
  const patch = {};
  ["name", "breed", "age", "gender", "description"].forEach((k) => {
    if (data[k] !== undefined) patch[k] = data[k];
  });
  if (data.species !== undefined) patch.species = (data.species || "").toLowerCase();
  if (data.imageUrl !== undefined) patch.imageUrl = data.imageUrl;
  if (data.isVaccinated !== undefined) patch.isVaccinated = !!data.isVaccinated;
  if (data.isSterilized !== undefined) patch.isSterilized = !!data.isSterilized;
  if (data.adoptionStatus !== undefined) patch.adoptionStatus = data.adoptionStatus;

  const animal = await prisma.animal.update({ where: { id: animalId }, data: patch, include: { shelter: true } });
  return mapAnimal(animal);
};

const deleteAnimal = async (userId, animalId) => {
  await assertOwnsAnimal(userId, animalId);
  await prisma.animal.delete({ where: { id: animalId } });
  return { success: true };
};

const listShelterApplications = async (userId) => {
  const shelter = await prisma.shelter.findFirst({ where: { ownerUserId: userId } });
  if (!shelter) return [];
  const rows = await prisma.adoptionApplication.findMany({
    where: { animal: { shelterId: shelter.id } },
    include: { animal: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((app) => ({
    id: app.id,
    status: app.status,
    created_at: app.createdAt,
    full_name: app.fullName,
    phone: app.phoneNumber,
    email: app.email,
    address: app.address,
    experience: app.experience,
    reason: app.reason,
    animal: { id: app.animalId, name: app.animal?.name, type: cap(app.animal?.species) },
  }));
};

const updateApplicationStatus = async (userId, applicationId, status) => {
  const app = await prisma.adoptionApplication.findUnique({
    where: { id: applicationId },
    include: { animal: { include: { shelter: true } } },
  });
  if (!app) throw ApiError.notFound("Permohonan tidak ditemukan");
  if (app.animal?.shelter?.ownerUserId !== userId) throw ApiError.forbidden("Akses ditolak");
  return prisma.adoptionApplication.update({ where: { id: applicationId }, data: { status } });
};

module.exports = {
  listAnimals, getAnimalById, applyAdoption, listMyApplications,
  createAnimal, listShelterAnimals, updateAnimal, deleteAnimal,
  listShelterApplications, updateApplicationStatus,
};