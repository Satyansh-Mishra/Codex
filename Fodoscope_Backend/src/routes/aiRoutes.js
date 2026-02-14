const express = require("express");
const aiRouter = express.Router();

// Upload middleware
const {
  upload,
  uploadToCloudinary,
} = require("../middleware/uploadMiddleware");

// Auth & Session middleware
const guestMiddleware = require("../middleware/guestMiddleware");
const supabaseAuth = require("../middleware/supabaseAuthMiddleware");
const trialMiddleware = require("../middleware/trialMiddleware");

// Utils
const asyncHandler = require("../utils/asyncHandler");

// Controller
const aiController = require("../controllers/aiController");

aiRouter.post(
  "/analyze",
  guestMiddleware,            // Guest support
  supabaseAuth,               // Optional login
  trialMiddleware,            // Trial check
  upload.single("image"),     // Image upload
  uploadToCloudinary,         // Cloudinary
  asyncHandler(aiController.analyzeFood)
);

module.exports = aiRouter;
