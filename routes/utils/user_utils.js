const DButils = require("./DButils");
const axios = require('axios');
require("dotenv").config();




async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getRecipes(user_id){

}

async function getRecipesPreview(recipes_id_array){

}


async function MarkAsVeiwed(user_id,recipe_id) {
}



exports.getRecipesPreview = getRecipesPreview;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getRecipes = getRecipes;