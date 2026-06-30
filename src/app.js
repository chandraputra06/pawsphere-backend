const express = require("express");
const cors = require("cors");

const { env } = require("./config/env");
const apiRoutes = require("./routes");
const notFoundHandler = require("./middlewares/not-found");
const errorHandler = require("./middlewares/error-handler");

const app = express();


const corsOrigins =
  env.corsOrigin === "*"
    ? "*"
    : env.corsOrigin.split(",").map((origin) => origin.trim());

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

// --- Body parsers ---
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --- API routes (mounted under /api) ---
app.use("/api", apiRoutes);

// --- Root ---
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the PawSphere API. See /api/health for status.",
    data: null,
  });
});

// --- 404 + error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
