const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");
const recipes_help_utils = require("./recipes_help_utils");
/**
 * This File is for all the get functions that are related to the recipes
 * Get from the DB and from the Spoonacular API
 */

// Get from spooncular response and extract the relevant recipe data
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

// synchonic function to get the recipes OverView in JSON format, from the Spoonacular API
async function getRecipeOverViewSpoonacular(recipe_id) {
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

// synchonic function that get array of recipes IDs, and returns the recipes OverView in JSON format
async function getRecipeDetails(recipeIds_array,user_id) {
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

  const localResults = await recipes_help_utils.getLocalRecipes(localRecipes,user_id);
  const spoonacularResults = await recipes_help_utils.getSpoonacularRecipes(spoonacularIds,user_id);

  return [...localResults, ...spoonacularResults];

}



module.exports = {
    // for single recipe overView from Spoonacular
    getRecipeOverViewSpoonacular,
    // for multiple recipes from DB and Spoonacular
    getRecipeDetails,
    // get single recipe data from Spoonacular
    getRecipeInformation
}