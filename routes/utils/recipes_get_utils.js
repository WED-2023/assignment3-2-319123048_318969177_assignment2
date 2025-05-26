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
    let {
        id,
        title,
        readyInMinutes,
        image,
        aggregateLikes,
        vegan,
        vegetarian,
        glutenFree
    } = recipe_info.data;

    // Check if recipe is already in likes table
    const recipeFromLikesDB = await getFromLikeDB(recipe_id);

    const popularity = recipeFromLikesDB
        ? recipeFromLikesDB.likes_count
        : aggregateLikes;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: popularity,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree
    };
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


// function to get 3 random recipes from the Spoonacular API
async function getRandomSpoonacularRecipes() {
    return await axios.get(`${api_domain}/random`, {
        params: {
            number: 3,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

// function to get 3 random recipes from the Spoonacular API
async function getRandomRecipes() {
    try {
        const response = await getRandomSpoonacularRecipes();
        const recipes = response?.data?.recipes;
        if (!Array.isArray(recipes)) {
            throw new Error("No recipes found in the Spoonacular response.");
          }
        const ids = recipes.map(recipe => recipe.id);
        res = []
        for (const recipe_id of ids) {
          console.log("recipe_id", recipe_id);
            recipe = await getRecipeOverViewSpoonacular(recipe_id);
            res.push(recipe);
        }
        return res;
    } catch (error) {
        console.error("Error fetching random recipes:", error);
        throw error;
    }
}

// function to get the recipe id as a list 
function getRecipesID(res_response) {
    return res_response.data.results.map(item => item.id);
}

// function to get recipes from the Spoonacular API using complex search
// GET https://api.spoonacular.com/recipes/complexSearch 
async function getRecipeComplex(params) {
    return await axios.get(`${api_domain}/complexSearch`, {
        params
    });
}

// function to get the recipe id and popularity from the likes table
async function getFromLikeDB(recipe_id) {
  const result = await DButils.execQuery(
    `SELECT recipe_id, likes_count FROM recipe_likes WHERE recipe_id = '${recipe_id}'`
  );
  if (result.length === 0) return null;
  return { id: result[0].recipe_id, popularity: result[0].likes_count };
}

// function to extract recipe details from the Spoonacular API response
async function extractRecipeDetails(recipe) {
  const {
    id,
    title,
    image,
    readyInMinutes,
    aggregateLikes,
    vegan,
    vegetarian,
    glutenFree,
    servings,
    instructions,
    extendedIngredients,
    creditsText,     
    occasions        
  } = recipe;

  // Extract ingredients with name, amount, unit
  const ingredients = extendedIngredients.map(ingredient => ({
    name: ingredient.name,
    amount: ingredient.amount,
    unit: ingredient.unit
  }));

  // Handle instructions array 
  const instructionSteps = recipe.analyzedInstructions?.length > 0
    ? recipe.analyzedInstructions[0].steps.map(step => step.step)
    : instructions ? [instructions] : [];

  // Extract occasion if exists (first one, or null)
  const occasion = occasions.length > 0 ? occasions[0] : null;

  return {
    id,
    title,
    image,
    readyInMinutes,
    popularity: aggregateLikes,
    vegan,
    vegetarian,
    glutenFree,
    servings,
    instructions: instructionSteps,
    ingredients,
    createdBy: creditsText || "unknown",
    occasion
  };
}


// function to get all the data about the recipe from Spoonacular API
async function getRecipeSpoonacular(recipe_id) {
    const recipe = await getRecipeInformation(recipe_id);
    if (!recipe) {
        return null;
    }
    const recipeDetails = await extractRecipeDetails(recipe.data);
    return recipeDetails;
}


// function to gat all the data about the recipe from DB
async function getRecipeFromDB(recipe_id) {
    try {
      const recipeQuery = `
        SELECT *
        FROM recipes
        WHERE recipe_id = '${recipe_id}'
      `;
      const [recipe] = await DButils.execQuery(recipeQuery);

      const ingredientsQuery = `
        SELECT name, amount, unit
        FROM ingredients
        WHERE recipe_id = '${recipe_id}'
      `;
      const ingredients = await DButils.execQuery(ingredientsQuery);

    
      let instructionSteps = [];
      try {
        instructionSteps = JSON.parse(recipe.instructions);
      } catch (e) {
        instructionSteps = recipe.instructions ? [recipe.instructions] : [];
      }

    
      return {
        id: recipe.recipe_id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.ready_in_minutes,
        popularity: recipe.popularity,
        vegan: Boolean(recipe.vegan),
        vegetarian: Boolean(recipe.vegetarian),
        glutenFree: Boolean(recipe.gluten_free),
        servings: recipe.servings,
        instructions: instructionSteps,
        ingredients: ingredients.map(ing => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit
        })),
        createdBy: recipe.created_by,
        isFamily: recipe.isFamily || false,
        familyMember: recipe.family_member || null,
        occasion: recipe.occasion || null
      };
  } catch (error) {
    console.error("Error fetching local recipe:", error.message);
    throw error;
  }
}


// a function that get recipe ID and fetches from the DB the popularity
async function getLocalRecipeLikes(recipe_id,user_id) {
  
    const result = await DButils.execQuery(
        `SELECT popularity FROM recipes WHERE recipe_id = '${recipe_id}' and user_id = '${user_id}'`
    );
    if (result.length === 0) return null;
    return result[0].popularity;
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
    getRecipeInformation,
    // get random recipes from Spoonacular
    getRandomRecipes,
    //map id to list
    getRecipesID,
    // get recipes from Spoonacular using complex search
    getRecipeComplex,
    // get recipe id and popularity from the likes table
    getFromLikeDB,
    // get all the data about the recipe from Spoonacular API
    getRecipeSpoonacular,
    // get all details abput a recipe from DB
    getRecipeFromDB,
    // get from DB likes of a DB recipe
    getLocalRecipeLikes
    
}