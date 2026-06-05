const { PrismaClient } = require("@prisma/client");

// A single shared PrismaClient instance for the whole app.
// In development, nodemon reloads can create multiple instances and
// exhaust the DB connection pool, so we cache it on globalThis.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__pawspherePrisma__ ||
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__pawspherePrisma__ = prisma;
}

module.exports = prisma;
