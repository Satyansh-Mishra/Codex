const ApiResponse = require("../utils/ApiResponse");
const {
  getRecipeDescriptionById,
} = require("../services/reciepeService.js");

const getRecipeDetails = async (req, res) => {
  const { id } = req.params;

  const recipe = await getRecipeDescriptionById(id);

  return res.status(200).json(
    new ApiResponse(200, "Recipe details fetched", recipe)
  );
};

module.exports = { getRecipeDetails };