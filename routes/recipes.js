var express = require("express");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
var router = express.Router();
const recipes_get_utils = require("./utils/recipes_get_utils");
const recipes_post_utils = require("./utils/recipes_post_utils");

/**
 * This path return 3 random recipes from spoonacular API
* GET https://api.spoonacular.com/recipes/random 
*/

router.get("/random", async (req, res, next) => {
    try{
        const recipes = await recipes_get_utils.getRandomRecipes();
        if (!recipes) {
            throw new Error("No recipes found in the Spoonacular response.");
          }
        res.status(200).send(recipes);
    }catch (error) {
        console.log("Error in get random recipes: ", error);
        next(error);
    }
});


/** 
 * This path return a recipe by id from spoonacular API
 */

router.get("/:recipeid", async (req, res, next) => {
    try{
        const recipe_id = String(req.params.recipeid);
        // check if the recipe_id is from DB
        if (recipe_id.includes("ID")){
            const recipe = await recipes_get_utils.getRecipeFromDB(recipe_id);
            if(!recipe){
                res.status(404).send("No such recipe with the given id");
            }
            res.status(200).send(recipe);
        }
        // the recipe_id is from spoonacular
        else{
            const reciepe = await recipes_get_utils.getRecipeSpoonacular(parseInt(recipe_id));
            if(!reciepe){
                res.status(404).send("No such recipe with the given id");
            }
            res.status(200).send(recipe);
        } 
        } catch(error){
            console.log("Error in get recipe by id: ",error);
            next(error);
        }
    });


/**
 * This path adds a like to a recipe (both from API and DB)
 */
router.post("/:recipe_id/like", async (req, res, next) => {
  try {
    const recipe_id = String(req.params.recipe_id);
    const user_id = req.session?.user_id;
    const isUserRecipe = recipe_id.includes("ID");

    let recipeData;
    let popularity = 0;

    // 1. Check if the recipe is already in the likes table
    const recipeInLikes = await recipes_get_utils.getFromLikeDB(recipe_id);

    if (!recipeInLikes) {
      // 2. If the recipe is a user-created recipe
      if (isUserRecipe) {
        if (!user_id) throw new Error("You must be logged in to like user-created recipes");

        recipeData = await recipes_get_utils.getLocalRecipeLikes(recipe_id, user_id);
        if (!recipeData) throw new Error("User recipe not found");

        popularity = 1;

        // Save like in like table
        await recipes_post_utils.addRecipeToLikeDB(recipe_id, popularity);

        // Update popularity in the user's recipe table
        await recipes_post_utils.updateRecipePopularityInUserDB(recipe_id, popularity, user_id);

        return res.status(200).send({ success: true, recipe_id, popularity });

      } else {
        // 3. API recipe
        recipeData = await recipes_get_utils.getRecipeOverViewSpoonacular(recipe_id);
        if (!recipeData || typeof recipeData.popularity !== "number") {
          throw new Error("API recipe data invalid or popularity not found");
        }

        popularity = recipeData.popularity + 1;

        await recipes_post_utils.addRecipeToLikeDB(recipe_id, popularity);

        return res.status(200).send({ success: true, recipe_id, popularity });
      }
    }

    // 4. If already exists in likes table, increment
    const currentPopularity = Number(recipeInLikes.likes_count);
    if (isNaN(currentPopularity)) throw new Error("Current popularity is not a number");

    const updatedPopularity = currentPopularity + 1;

    // Update like count
    await recipes_post_utils.updateRecipePopularity(recipe_id, updatedPopularity);

    if (isUserRecipe && user_id) {
      await recipes_post_utils.updateRecipePopularityInUserDB(recipe_id, updatedPopularity, user_id);
    }

    res.status(200).send({ success: true, recipe_id, popularity: updatedPopularity });

  } catch (error) {
    console.error("Error in liking recipe:", error);
    next(error);
  }
});


/**
 * This path returns the number of likes for a recipe (from API or DB)
 */
router.get("/:recipe_id/likes", async (req, res, next) => {
  try {
    const recipe_id = String(req.params.recipe_id);
    const isUserRecipe = recipe_id.includes("ID");

    const recipeInLikes = await recipes_get_utils.getFromLikeDB(recipe_id);

    if (recipeInLikes) {
      res.status(200).send({ recipe_id, likes: Number(recipeInLikes.likes_count) });
    } else {
      if (isUserRecipe) {
        const recipeFromUserDB = await recipes_get_utils.getLocalRecipe(recipe_id);
        const likes = recipeFromUserDB ? Number(recipeFromUserDB.popularity || 0) : 0;
        res.status(200).send({ recipe_id, likes });
      } else {
        const recipeFromAPI = await recipes_get_utils.getRecipeOverViewSpoonacular(recipe_id);
        const likes = recipeFromAPI ? recipeFromAPI.aggregateLikes : 0;
        res.status(200).send({ recipe_id, likes });
      }
    }

  } catch (error) {
    console.error("Error in getting recipe likes:", error);
    next(error);
  }
});

/** 
 * This path return a recipe from spoonacular API by criterias for searching
 * Default limit is 5
 * Can search by query, cuisine, diet, intolerances, sortBy and sortDirection
 */

router.get("",async (req, res, next) => {
    try{
        const criteria = req.query;
        const params = {
            apiKey: process.env.spooncular_apiKey,
            number: criteria.limit || 5,
            query: criteria.query,
            cuisine: criteria.cuisine,
            diet: criteria.diet,
            intolerances: criteria.intolerances,
            sort: criteria.sortBy,
            sortDirection: criteria.sortDirection
        };
        Object.keys(params).forEach(key => {
        if (params[key] === undefined) delete params[key];
        }); 


        const res_spon = await recipes_get_utils.getRecipeComplex(params);
        if (!res_spon){
            res.status(404).send("No such recipe with the given criterias");
        }
        const reciepe_id = await recipes_get_utils.getRecipesID(res_spon);
        const array_of_recipe= [];
        for (const id of reciepe_id) {
            const tmp = await recipes_get_utils.getRecipeOverViewSpoonacular(id);
            array_of_recipe.push(tmp);
        }

        res.status(200).send(array_of_recipe); 
        } catch(error){
            console.log("Error in get recipe by id: ",error);
            next(error);
        }
    });
module.exports = router;
