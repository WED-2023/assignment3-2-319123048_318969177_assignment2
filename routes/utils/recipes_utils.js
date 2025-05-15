const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

// Get the highest existing recipe number for this user and generante a new one
async function generateCustomRecipeId(user_id) {
  
  const existing = await DButils.execQuery(
    `SELECT recipe_id FROM recipes WHERE user_id=${user_id}`
  );

  let maxNum = 1000;
  for (let recipe of existing) {
    const match = recipe.recipe_id.match(/^(\d+)noa$/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNum) maxNum = num;
    }
  }

  const nextId = `${maxNum + 1}noa`;
  return nextId;
}


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey_noa
        }
    });
}

async function getRecipeDetails(recipe_id) {
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



exports.getRecipeDetails = getRecipeDetails;



