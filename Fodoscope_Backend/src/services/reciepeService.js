const axios = require("axios");
const ApiError = require("../utils/ApiError");

/* ----------------------------------
   Axios Client
-----------------------------------*/
const recipeClient = axios.create({
  baseURL: "https://api.foodoscope.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.RECIPDB_API_KEY}`,
  },
  timeout: 15000,
});

/* ----------------------------------
   Get Recipes Using AI Detections
-----------------------------------*/
const getRecipesFromDetections = async (detections = []) => {
  try {
    if (!detections.length) {
      throw new ApiError(400, "Detections are required");
    }

    // Convert array → "Onion,Tomato"
    const includeIngredients = detections
      .map((item) => item.trim().toLowerCase())
      .join(",");

    // console.log(includeIngredients)

    const response = await recipeClient.get(
      "/recipe2-api/recipe/recipesinfo",
      {
        params: {
          includeIngredients,
          page: 1,
          limit: 3,
        },
      }
    );
    // console.log("Hello")
    const data = response.data;

    if (!data || !data.payload || !data.payload.data) {
      throw new ApiError(500, "Invalid RecipeDB response format");
    }

    // Clean result for frontend
    const recipes = data.payload.data.map((item) => ({
      id: item.Recipe_id,
      name: item.Recipe_title,
      cuisine: item.Cuisine || "Unknown",
      image: item.image_url || null,
      ingredients:
        item.ingredients?.map((i) => i.name) || [],
      calories: item.nutrition?.calories || null,
    }));

    return recipes;

  } catch (error) {
    console.error("RecipeDB API Error:", error.message);

    if (error.response) {
      console.error("RecipeDB Response:", error.response.data);
    }

    throw new ApiError(500, "Failed to fetch recipes from RecipeDB");
  }
};

const getRecipeDescriptionById = async (recipeId) => {
  try {
    if (!recipeId) {
      throw new ApiError(400, "Recipe ID is required");
    }

    /* -----------------------------
       1️⃣ Get Recipe Info
    ------------------------------*/
    const recipeRes = await recipeClient.get(
      `/recipe2-api/search-recipe/${recipeId}`
    );

    const recipeData = recipeRes.data;

    if (!recipeData?.recipe) {
      throw new ApiError(404, "Recipe not found");
    }

    /* -----------------------------
       2️⃣ Get Instructions
    ------------------------------*/
    const stepsRes = await recipeClient.get(
      `/recipe2-api/instructions/${recipeId}`
    );

    const stepsData = stepsRes.data;

    /* -----------------------------
       3️⃣ Clean & Merge Data
    ------------------------------*/

    const recipe = recipeData.recipe;
    const ingredientsRaw = recipeData.ingredients || [];
    const stepsRaw = stepsData?.steps || [];

    // Clean ingredients
    const ingredients = ingredientsRaw.map((item) => ({
      name: item.ingredient,
      quantity: item.quantity || null,
      unit: item.unit || null,
      state: item.state || null,
      phrase: item.ingredient_Phrase,
    }));

    // Clean steps
    const steps = stepsRaw.map((step, index) => ({
      stepNumber: index + 1,
      instruction: step,
    }));

    /* -----------------------------
       4️⃣ Final Structured Response
    ------------------------------*/
    const result = {
      id: recipe.Recipe_id,
      title: recipe.Recipe_title,

      cuisine: {
        region: recipe.Region,
        subRegion: recipe.Sub_region,
        continent: recipe.Continent,
      },

      time: {
        prep: recipe.prep_time + " min",
        cook: recipe.cook_time + " min",
        total: recipe.total_time + " min",
      },

      servings: recipe.servings,

      nutrition: {
        calories: recipe.Calories,
        energy: recipe["Energy (kcal)"],
        protein: recipe["Protein (g)"],
        fat: recipe["Total lipid (fat) (g)"],
        carbs: recipe["Carbohydrate, by difference (g)"],
      },

      dietType: {
        vegan: recipe.vegan === "1.0",
        vegetarian: recipe.lacto_vegetarian === "1.0",
        ovoVegetarian: recipe.ovo_vegetarian === "1.0",
      },

      utensils: recipe.Utensils?.split("||") || [],
      processes: recipe.Processes?.split("||") || [],

      ingredients,

      instructions: steps,
    };

    return result;

  } catch (error) {
    console.error("Recipe Description Error:", error.message);

    if (error.response) {
      console.error("API Response:", error.response.data);
    }

    throw new ApiError(
      500,
      "Failed to fetch recipe description"
    );
  }
};

module.exports = {
  getRecipesFromDetections,
  getRecipeDescriptionById,
};
