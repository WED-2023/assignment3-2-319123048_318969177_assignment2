const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");
const recipes_get_utils = require("./recipes_get_utils");
const user_utils = require("./user_utils");
/**
 * This file is for all the functions that help the logic of the recipes, and are 'private' to the recipes
 */


// function to get the recipes overview from the Spoonacular API, using the existing functions
async function getSpoonacularRecipes(spoonacularIds,user_id) {
  if (spoonacularIds.length === 0) return [];

    try {
    const [favorites, viewed] = user_id
      ? await Promise.all([
          user_utils.getFavoriteRecipeIds(user_id),
          user_utils.getViewedRecipeIds(user_id)
        ])
      : [[], []];

    const results = await Promise.all(
      spoonacularIds.map(async (id) => {
        const recipe = await recipes_get_utils.getRecipeOverViewSpoonacular(id);
        return {
          ...recipe,
          isFavorite: favorites.includes(id.toString()),
          isWatched: viewed.includes(id.toString())
        };
      })
    );

    return results;
  } catch (err) {
    console.error("Spoonacular fetch error:", err.message);
    throw err;
  }
}

// function to get the recipes overview from the DB
async function getLocalRecipes(localRecipes, user_id) {
  if (localRecipes.length === 0) return [];

  const formattedIds = localRecipes.map(id => `'${id}'`).join(",");

  const query = `
    SELECT recipe_id, title, ready_in_minutes, image, popularity, vegan, vegetarian, gluten_free
    FROM recipes
    WHERE recipe_id IN (${formattedIds})
  `;

  try {
    const [localResults, favorites, viewed] = await Promise.all([
      DButils.execQuery(query),
      user_id ? user_utils.getFavoriteRecipes(user_id) : [],
      user_id ? user_utils.getAllViewedRecipes(user_id) : []
    ]);

    return localResults.map(recipe => ({
      id: recipe.recipe_id,
      title: recipe.title,
      readyInMinutes: recipe.ready_in_minutes,
      image: recipe.image,
      popularity: recipe.popularity,
      vegan: recipe.vegan,
      vegetarian: recipe.vegetarian,
      glutenFree: recipe.gluten_free,
      isFavorite: favorites.includes(recipe.recipe_id),
      isWatched: viewed.includes(recipe.recipe_id)
    }));
  } catch (err) {
    console.error("DB fetch error:", err.message);
    throw err;
  }
}



module.exports = {
    // for multiple recipe from Spoonacular
    getSpoonacularRecipes,
    // for multiple recipes from DB 
    getLocalRecipes
}