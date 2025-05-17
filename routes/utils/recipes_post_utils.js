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


// create a new recipe in the DB
async function createRecipe(user_id, recipe_details) {
  const recipe_id = await generateCustomRecipeId(user_id);
  //insert recipe details into the DB
    await DButils.execQuery(`
      INSERT INTO recipes (
        recipe_id, user_id, title, ready_in_minutes, image, popularity,
        vegan, vegetarian, gluten_free, instructions, servings,
        created_by, is_family, family_member, occasion
      )
      VALUES (
        '${recipe_id}', '${user_id}', '${recipe_details.title}', '${recipe_details.readyInMinutes}', '${recipe_details.image}',
        '${recipe_details.popularity || 0}', '${recipe_details.isvegan}', '${recipe_details.isvegetarian}', '${recipe_details.isglutenFree}',
        '${JSON.stringify(recipe_details.instructions)}', '${recipe_details.servings}',
        '${recipe_details.createrBy}', '${recipe_details.isFamily}', '${recipe_details.familyMember}', '${recipe_details.occusion}'
      );
    `);

  //insert recipe ingredients into the DB   
  for (const ingredient of recipe_details.ingredients) {
      await DButils.execQuery(`
        INSERT INTO ingredients (recipe_id, name, amount, unit)
        VALUES (
          '${recipe_id}', '${ingredient.name}', '${ingredient.amount}', '${ingredient.unit}'
        );
      `);
    }
  return recipe_id;

}


module.exports = {
  createRecipe
};



