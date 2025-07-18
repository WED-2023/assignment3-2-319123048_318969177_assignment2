const DButils = require("./DButils");
require("dotenv").config();

async function markAsFavorite(user_id, recipe_id) {
  const checkQuery = `SELECT * FROM FavoriteRecipes WHERE user_id='${user_id}' AND recipe_id='${recipe_id}'`;
  const existing = await DButils.execQuery(checkQuery);

  if (existing.length > 0) {
    return;
  }

  const insertQuery = `INSERT INTO FavoriteRecipes (user_id, recipe_id) VALUES ('${user_id}', '${recipe_id}')`;
  await DButils.execQuery(insertQuery);
}

// synchronic function to get the favorite recipes of the logged-in user
async function getFavoriteRecipes(user_id){
  const result = await DButils.execQuery(`SELECT recipe_id FROM FavoriteRecipes WHERE user_id='${user_id}'`);
  return result.map(r => r.recipe_id); 
}

// synchronic function to get the recipes of the logged-in user from DB
async function getRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from recipes where user_id='${user_id}'`);
    return recipes_id;
}

// synchronic function to mark the recipe as viewed by the logged-in user
async function MarkAsVeiwed(user_id,recipe_id) {
    await DButils.execQuery(`
      INSERT INTO viewed_recipes (user_id, recipe_id)
      VALUES ('${user_id}', '${recipe_id}')
    `);
}

// synchronic function to get the recipe IDs of the viewed recipes of the logged-in user
async function getAllViewedRecipes(user_id) {
  const result = await DButils.execQuery(`SELECT recipe_id FROM viewed_recipes WHERE user_id='${user_id}'`);
  return result.map(r => r.recipe_id);
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
    WHERE user_id = '${user_id}' AND is_family = 1
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
    getLastSearch,
    getViewedRecipes,
    getAllViewedRecipes
};
