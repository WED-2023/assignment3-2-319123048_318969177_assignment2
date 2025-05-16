const DButils = require("./DButils");
const recipe_utils = require("./recipe_utils");
require("dotenv").config();

// synchonic function to add the recipe to the favorite list of the logged-in user
async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}
// synchonic function to get the favorite recipes of the logged-in user
async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

// synchonic function to get the recipes preview of the logged-in user from recipe_util.js
async function getRecipesPreview(recipes_id_array){
    return await recipe_utils.getRecipeDetails(recipes_id_array);
}

async function getRecipes(user_id){

}




async function MarkAsVeiwed(user_id,recipe_id) {
}



module.exports = {
    markAsFavorite,
    getFavoriteRecipes,
    getRecipesPreview,
    getRecipes,
    MarkAsVeiwed
};
