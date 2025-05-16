const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

// Get the highest existing recipe number for this user and generante a new one
async function generateCustomRecipeId(user_id) {
  
  const existing = await DButils.execQuery(
    `SELECT recipe_id FROM recipes WHERE user_id=${user_id}`
  );

  let maxNum = 1000;
  for (let recipe of existing) {
    const match = recipe.recipe_id.match(/^(\d+)ID$/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNum) maxNum = num;
    }
  }

  const nextId = `${maxNum + 1}ID`;
  return nextId;
}


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */

async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey_noa
        }
    });
}

// synchonic function to get the recipes preview in JSON format
async function getRecipeOverView(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}


async function getRecipeDetails(recipeIds_array) {
  const localRecipes = [];
  const spoonacularIds = [];

  // Split the IDs to local and Spoonacular IDs arrays, local IDs are strings that contain "ID"
  for (const id of recipeIds_array) {
    if (id.includes("ID")) {
      localRecipes.push(id);
    } else {
      spoonacularIds.push(id);
    }
  }

  const results = [];

  // Step 2: Fetch local recipes from DB
  if (localRecipes.length > 0) {
    const formattedIds = localRecipes.map(id => `'${id}'`).join(",");
    try {
      const localResults = await DButils.execQuery(
        `SELECT * FROM recipes WHERE recipe_id IN (${formattedIds})`
      );
      results.push(...localResults);
    } catch (err) {
      console.error("DB fetch error:", err.message);
    }
  }

  // Step 3: Fetch Spoonacular recipes
  if (spoonacularIds.length > 0) {
    try {
      const spoonacularResponse = await axios.get(
        "https://api.spoonacular.com/recipes/informationBulk",
        {
          params: {
            apiKey: process.env.spoonacular_api_key,
            ids: spoonacularIds.join(",")
          }
        }
      );
      results.push(...spoonacularResponse.data);
    } catch (err) {
      console.error("Spoonacular fetch error:", err.response?.data || err.message);
    }
  }

  return results;
}

module.exports = {
  generateCustomRecipeId,
  getRecipeOverView,
  getRecipeInformation,
  getRecipeDetails
};



