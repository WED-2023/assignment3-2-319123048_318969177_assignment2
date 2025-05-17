const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");
const recipes_get_utils = require("./recipes_get_utils");
/**
 * This file is for all the functions that help the logic of the recipes, and are 'private' to the recipes
 */


// function to get the recipes overview from the Spoonacular API, using the existing functions
async function getSpoonacularRecipes(spoonacularIds) {
  if (spoonacularIds.length === 0) return [];

  try {
    // Parallel fetching all Spoonacular recipes
    const results = await Promise.all(
      spoonacularIds.map(id => recipes_get_utils.getRecipeOverViewSpoonacular(id))
    );
    return results;
  } catch (err) {
    console.error("Spoonacular fetch error:", err.message);
    throw err;
  }
}

// function to get the recipes overview from the DB
async function getLocalRecipes(localRecipes) {
  if (localRecipes.length === 0) return [];

  // Format IDs for SQL IN clause, e.g., ('102ID','103ID')
  const formattedIds = localRecipes.map(id => `'${id}'`).join(",");

  const query = `
    SELECT recipe_id, title, ready_in_minutes, image, popularity, vegan, vegetarian, gluten_free
    FROM recipes
    WHERE recipe_id IN (${formattedIds})
  `;

  try {
    const localResults = await DButils.execQuery(query);
    return localResults.map(recipe => ({
      id: recipe.recipe_id,
      title: recipe.title,
      readyInMinutes: recipe.ready_in_minutes,
      image: recipe.image,
      popularity: recipe.popularity,
      vegan: recipe.vegan,
      vegetarian: recipe.vegetarian,
      glutenFree: recipe.gluten_free,
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