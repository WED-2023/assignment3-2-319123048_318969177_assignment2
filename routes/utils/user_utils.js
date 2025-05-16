const DButils = require("./DButils");
const recipe_post_utils = require("./recipe_post_utils");
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
