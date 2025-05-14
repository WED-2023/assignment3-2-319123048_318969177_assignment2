const DButils = require("./DButils");
const recipe_utils = require("./recipes_utils");

/**
 * Mark a recipe as favorite for a user
 * @param {number} user_id - User ID
 * @param {number} recipe_id - Recipe ID
 */
async function markAsFavorite(user_id, recipe_id){
    // Check if recipe is already marked as favorite
    const favorites = await DButils.execQuery(
        `SELECT * FROM FavoriteRecipes WHERE user_id='${user_id}' AND recipe_id=${recipe_id}`
    );
    
    if (favorites.length === 0) {
        await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
    }
}

/**
 * Get favorite recipes for a user
 * @param {number} user_id - User ID
 */
async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

/**
 * Mark a recipe as viewed by a user
 * @param {number} user_id - User ID
 * @param {number} recipe_id - Recipe ID
 */
async function markAsViewed(user_id, recipe_id) {
    // Check if this recipe is already viewed
    const views = await DButils.execQuery(
        `SELECT * FROM viewed_recipes WHERE user_id=${user_id} AND recipe_id=${recipe_id}`
    );
    
    if (views.length === 0) {
        // Insert new view
        await DButils.execQuery(`
            INSERT INTO viewed_recipes (user_id, recipe_id, view_timestamp)
            VALUES (${user_id}, ${recipe_id}, NOW())
        `);
    } else {
        // Update timestamp
        await DButils.execQuery(`
            UPDATE viewed_recipes
            SET view_timestamp = NOW()
            WHERE user_id=${user_id} AND recipe_id=${recipe_id}
        `);
    }
}

/**
 * Get the last viewed recipes for a user
 * @param {number} user_id - User ID
 * @param {number} limit - Maximum number of results to retrieve
 */
async function getLastViewedRecipes(user_id, limit = 3) {
    // Get IDs of last viewed recipes
    const viewed_recipes = await DButils.execQuery(`
        SELECT recipe_id
        FROM viewed_recipes
        WHERE user_id=${user_id}
        ORDER BY view_timestamp DESC
        LIMIT ${limit}
    `);
    
    if (viewed_recipes.length === 0) {
        return [];
    }
    
    // Extract recipe IDs
    const recipe_ids = viewed_recipes.map(recipe => recipe.recipe_id);
    
    // Get preview data for these recipes
    return await recipe_utils.getRecipesPreview(recipe_ids);
}

/**
 * Get user's personal recipes
 * @param {number} user_id - User ID
 */
async function getUserRecipes(user_id) {
    // Get user's recipes that are not family recipes
    const recipes = await DButils.execQuery(`
        SELECT recipe_id, title, ready_in_minutes as readyInMinutes, image, popularity,
               vegan, vegetarian, gluten_free as glutenFree
        FROM recipes
        WHERE user_id=${user_id} AND is_family=0
    `);
    
    return recipes;
}

/**
 * Get user's family recipes
 * @param {number} user_id - User ID
 */
async function getFamilyRecipes(user_id) {
    // Get user's family recipes
    const recipes = await DButils.execQuery(`
        SELECT recipe_id, title, ready_in_minutes as readyInMinutes, image, popularity,
               vegan, vegetarian, gluten_free as glutenFree, family_member as familyMember,
               occasion
        FROM recipes
        WHERE user_id=${user_id} AND is_family=1
    `);
    
    return recipes;
}

/**
 * Get user's last searches
 * @param {number} user_id - User ID
 */
async function getLastSearches(user_id) {
    // Get last 5 searches
    const searches = await DButils.execQuery(`
        SELECT search_query, search_timestamp
        FROM user_searches
        WHERE user_id=${user_id}
        ORDER BY search_timestamp DESC
        LIMIT 5
    `);
    
    return searches;
}

module.exports = {
    markAsFavorite,
    getFavoriteRecipes,
    markAsViewed,
    getLastViewedRecipes,
    getUserRecipes,
    getFamilyRecipes,
    getLastSearches
};