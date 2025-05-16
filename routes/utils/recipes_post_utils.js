const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

// Get the highest existing recipe number for this user and generante a new one
async function generateCustomRecipeId(user_id) {
  const existing = await DButils.execQuery(
    `SELECT recipe_id FROM recipes WHERE user_id=${user_id}`
  );
  let maxNum = 1000;
  for (let recipe of existing) {
    const match = recipe.recipe_id.match(/^(\d+)ID$/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNum) maxNum = num;
    }
  }
  const nextId = `${maxNum + 1}ID`;
  return nextId;
}



module.exports = {
  generateCustomRecipeId
};



