const DButils = require("./DButils");
const recipe_post_utils = require("./recipe_post_utils");
const recipes_help_utils = require("./utils/recipes_help_utils");
const recipes_get_utils = require("./utils/recipes_get_utils");
require("dotenv").config();

// synchronic function to add the recipe to the favorite list of the logged-in user
async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${user_id}',${recipe_id})`);
}

// synchronic function to get the favorite recipes of the logged-in user
async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from favoriterecipes where user_id='${user_id}'`);
    return recipes_id;
}

// synchronic function to get the recipes of the logged-in user from DB
async function getRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from recipes where user_id='${user_id}'`);
    return recipes_id;
}

// synchronic function to mark the recipe as viewed by the logged-in user
async function MarkAsVeiwed(user_id,recipe_id) {
    await DButils.execQuery(`insert into viewed_recipes values ('${user_id}',${recipe_id})`);
}

// synchonic function to get the 3 last viewed recipes of the logged-in user from DB
async function getViewedRecipes(user_id) {
  const recipes_id = await DButils.execQuery(`
    SELECT recipe_id
    FROM viewed_recipes
    WHERE user_id = '${user_id}'
    ORDER BY view_timestamp DESC
    LIMIT 3
  `);
  return recipes_id;
}

// synchronic function to get the recipe IDs of the Family Recipes of the logged-in user
async function getFamilyRecipes(user_id) {
  const recipes_id = await DButils.execQuery(`
    SELECT recipe_id
    FROM recipes
    WHERE user_id = '${user_id}' AND is_family = True
  `);
  return recipes_id;
}


async function getLastSearch(user_id) {
  const recipe_id = await DButils.execQuery(`
    SELECT recipe_id
    FROM user_searches
    WHERE user_id = '${user_id}'
    ORDER BY search_timestamp DESC
    LIMIT 1
  `);

  return recipe_id
}


module.exports = {
    markAsFavorite,
    getFavoriteRecipes,
    getRecipes,
    MarkAsVeiwed,
    getFamilyRecipes,
    getLastSearch
};
