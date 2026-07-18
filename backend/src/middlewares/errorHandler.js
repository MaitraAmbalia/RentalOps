const ApiError = require("../utils/apiError");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  // Handle Prisma errors
  if (err.code) {
    switch (err.code) {
      case "P2002":
        statusCode = 409;
        message = "Unique constraint failed: Record already exists.";
        errors = err.meta;
        break;
      case "P2025":
        statusCode = 404;
        message = "Record not found.";
        errors = err.meta;
        break;
      default:
        // Handle other Prisma errors if needed
        break;
    }
  }

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    statusCode,
  });
};

module.exports = errorHandler;
