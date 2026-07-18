const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const apiRoutes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/public", express.static(path.join(__dirname, "../public")));

// Root endpoint
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Presence Dashboard API",
  });
});

// API routes
app.use("/api", apiRoutes);

// 404 Handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;
