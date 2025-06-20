const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");

async function generateCustomRecipeId() {
  const result = await DButils.execQuery(`
    SELECT MAX(CAST(SUBSTRING(recipe_id, 1, LENGTH(recipe_id) - 2) AS UNSIGNED)) AS max_id
    FROM recipes
    WHERE recipe_id REGEXP '^[0-9]+ID$';
  `);

  const maxNum = result[0].max_id || 1000; // default start
  const nextId = `${maxNum + 1}ID`;
  return nextId;
}


// create a new recipe in the DB
async function createRecipe(user_id, recipe_details) {
  const recipe_id = await generateCustomRecipeId();
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

// function to add a recipe to the likes table with it's popularity
async function addRecipeToLikeDB(recipe_id, currentPopularity) {
  const newPopularity = currentPopularity + 1;
  await DButils.execQuery(
    `INSERT INTO recipe_likes (recipe_id, likes_count)
     VALUES ('${recipe_id}', ${newPopularity})`
  );
  return {recipe_id, newPopularity};
}


// Update user's recipe popularity in the recipes table
async function updateRecipePopularityInUserDB(recipe_id, currentPopularity,user_id) {
  const updatedPopularity = currentPopularity + 1;
  await DButils.execQuery(
    `UPDATE recipes
     SET popularity = ${updatedPopularity}
     WHERE recipe_id = '${recipe_id}' and user_id = '${user_id}'`
  );
  return {recipe_id, updatedPopularity};
}


// function to update the recipe popularity in the likes table
async function updateRecipePopularity(recipe_id, currentPopularity) {
  const updatedPopularity = Number(currentPopularity) + 1;
  await DButils.execQuery(
    `UPDATE recipe_likes
     SET likes_count = ${updatedPopularity}
     WHERE recipe_id = '${recipe_id}'`
  );
  return {recipe_id, updatedPopularity};
}

module.exports = {
  createRecipe,
  // add recipe to the likes table
  addRecipeToLikeDB,
  // update recipe popularity in the likes table
  updateRecipePopularity,
  // 
  updateRecipePopularityInUserDB
};



