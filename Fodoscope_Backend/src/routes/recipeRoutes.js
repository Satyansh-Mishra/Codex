const express = require("express");
const router = express.Router();

const { getRecipeDetails } = require("../controllers/recipeController");
const asyncHandler = require("../utils/asyncHandler");

router.get(
  "/:id",
  asyncHandler(getRecipeDetails)
);

module.exports = router;
