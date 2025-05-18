const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");
const user_utils = require("./user_utils");



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

// synchronic function that gets array of recipe IDs and returns recipes overview in JSON format
async function getRecipeDetails(recipeIds_array, user_id) {
  const localRecipes = [];
  const spoonacularIds = [];

  for (const id of recipeIds_array) {
    if(!id) continue; 
    if (id.includes("ID")) {
      localRecipes.push(id);
    } else {
      spoonacularIds.push(id);
    }
  }
  //if no recipe IDs are provided
  if (localRecipes.length === 0 && spoonacularIds.length === 0) {
    return []; 
  }
  if (localRecipes.length > 0 && spoonacularIds.length > 0) {
    const localResults = await getLocalRecipes(localRecipes, user_id);
  
    const spoonacularResults = await getSpoonacularRecipes(spoonacularIds, user_id);

    return [...localResults, ...spoonacularResults];
  }
  // if only spoonacular IDs are provided
  if (spoonacularIds.length > 0) {
    return await getSpoonacularRecipes(spoonacularIds, user_id);
  }
  // if only local IDs are provided
  if (localRecipes.length > 0) {
    return await getLocalRecipes(localRecipes, user_id);
  }
}

// function to get the recipes overview from the Spoonacular API
async function getSpoonacularRecipes(spoonacularIds, user_id) {
  if (spoonacularIds.length === 0) return [];

  try {
    const [favorites, viewed] = user_id
      ? await Promise.all([
          user_utils.getFavoriteRecipes(user_id) || [],
          user_utils.getAllViewedRecipes(user_id) || []
        ])
      : [[], []];

    const results = await Promise.all(
      spoonacularIds.map(async (id) => {
        const recipe = await getRecipeOverViewSpoonacular(id);
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
      user_id ? user_utils.getFavoriteRecipes(user_id) || [] : [],
      user_id ? user_utils.getAllViewedRecipes(user_id) || [] : []
    ]);

    return localResults.map(recipe => ({
      id: recipe.recipe_id,
      title: recipe.title,
      readyInMinutes: recipe.ready_in_minutes,
      image: recipe.image,
      popularity: recipe.popularity,
      vegan: Boolean(recipe.vegan),
      vegetarian: Boolean(recipe.vegetarian),
      glutenFree: Boolean(recipe.gluten_free),
      isFavorite: favorites.includes(recipe.recipe_id),
      isWatched: viewed.includes(recipe.recipe_id)
    }));
  } catch (err) {
    console.error("DB fetch error:", err.message);
    throw err;
  }
}


module.exports = {
    // for multiple recipes from DB 
    getLocalRecipes,
    // for multiple recipe from Spoonacular
    getSpoonacularRecipes,
    // for single recipe overView from Spoonacular
    getRecipeOverViewSpoonacular,
    // for multiple recipes from DB and Spoonacular
    getRecipeDetails,
    // get single recipe data from Spoonacular
    getRecipeInformation
}