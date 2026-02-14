const axios = require("axios");
const ApiError = require("../utils/ApiError");

/* ----------------------------------
   FlavorDB Client
-----------------------------------*/
const flavorClient = axios.create({
  baseURL: process.env.FLAVORDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.FLAVORDB_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/* ----------------------------------
   Get Pairings From FlavorDB
-----------------------------------*/
/**
 * Fetch top 3 pairings for ingredient
 */
const getTopPairings = async (ingredient) => {
  try {
    const res = await flavorClient.get(
      "/flavordb/food/by-alias",
      {
        params: { alias: ingredient },
      }
    );

    const data = res.data?.topSimilarEntities || [];

    return data
      .slice(0, 3)
      .map((item) => item.entityName.toLowerCase());

  } catch (err) {
    console.error("Pairing API Error:", err.message);
    return [];
  }
};

/* ----------------------------------
   Rank Recipes By Flavor Pairing
-----------------------------------*/
/**
 * Rank recipes using flavor pairing similarity
 *
 * @param {Array} detected - ["onion","potato"]
 * @param {Array} recipes - [{ name, ingredients }]
 */
const rankRecipesByFlavorPairing = async (
  detected = [],
  recipes = []
) => {
  try {
    if (!detected.length || !recipes.length) {
      return recipes;
    }

    /* ----------------------------
       1️⃣ Get All Pairings
    -----------------------------*/
    const pairingSet = new Set();

    // Parallel API calls (faster)
    const pairingResults = await Promise.all(
      detected.map((item) => getTopPairings(item))
    );

    pairingResults.forEach((list) => {
      list.forEach((p) => pairingSet.add(p));
    });

    const pairingArray = Array.from(pairingSet);

    /* ----------------------------
       2️⃣ Score Each Recipe
    -----------------------------*/
    const ranked = recipes.map((recipe) => {
      let score = 0;

      const recipeIngredients = recipe.ingredients.map(
        (i) => i.toLowerCase()
      );

      // Count matches
      pairingArray.forEach((pair) => {
        if (recipeIngredients.includes(pair)) {
          score++;
        }
      });

      return {
        ...recipe,
        pairingScore: score,
      };
    });

    /* ----------------------------
       3️⃣ Sort by Score
    -----------------------------*/
    ranked.sort(
      (a, b) => b.pairingScore - a.pairingScore
    );

    return ranked;

  } catch (err) {
    console.error("Ranking Error:", err.message);
    return recipes;
  }
};

module.exports = {
  rankRecipesByFlavorPairing,
};
