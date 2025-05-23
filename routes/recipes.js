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

router.get("/:recipe_id", async (req, res, next) => {
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
            const reciepe = await recipes_get_utils.getRecipeSpoonacular(int(recipe_id));
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
 * This path add like to recipe, if the recipe is not in the DB bring it from spoonacular API or from recipe DB
 * add it to the likes table and update the recipe popularity
 */

router.post("/:recipe_id/likes", async (req, res, next) => {
    try{
        const recipe_form_DB = await recipes_get_utils.getFromLikeDB(req.params.recipe_id);
        // if the recipe is not in the likes table, bring it from spoonacular API
        if(!recipe_form_DB){
            // bring the recipe from spoonacular API as overview
            const recipe = await recipes_get_utils.getRecipeOverViewSpoonacular(req.params.recipe_id);
            // add the recipe to likes table using id + popularity
            const recipe_id_popularity = await recipes_post_utils.addRecipeToLikeDB(recipe.id, recipe.popularity);
            res.status(200).send(recipe_id_popularity);
        }
        // if the recipe is in the likes DB, update the popularity and return it
        else{
            const recipe = await recipes_post_utils.updateRecipePopularity(recipe_form_DB.id, recipe_form_DB.popularity);
            res.status(200).send(recipe);
        }

    }catch (error) {
        console.log("Error in like recipe: ", error);
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
