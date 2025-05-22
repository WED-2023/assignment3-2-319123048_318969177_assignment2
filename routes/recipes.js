var express = require("express");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
var router = express.Router();
const recipes_get_utils = require("./utils/recipes_get_utils");
router.get("/", (req, res) => res.send("im here"));


// /**
//  * This path returns a full details of a recipe by its id 
//  */
// router.get("/:recipeId", async (req, res, next) => {
//   try {
//     const recipe = await recipes_get_utils.getRecipeOverView(req.params.recipeId);
//     res.send(recipe);
//   } catch (error) {
//     next(error);
//   }
// });


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

// /recipes/{recipeid}:
//     get:
//       tags: [Recipe]
//       summary: Get a specific recipe by ID


router.get("/:recipe_id", async (req, res, next) => {
    try{
        const recipe_id = String(req.params.recipeid);
        const reciepe = await recipes_get_utils.getRecipeOverViewSpoonacular(recipe_id);
        if(!reciepe){
            res.status(404).send("No such recipe with the given id");
        }
        res.status(200).send(recipe); 
        } catch(error){
            console.log("Error in get recipe by id: ",error);
            next(error);
        }
    });

//   /recipes/{recipeid}/like:
//     put:
//       tags: [Recipe]
//       summary: Like a recipe
//       description: Increase the popularity count (likes) of a recipe




// /recipes:
//     get:
//       tags: [Recipe]
//       summary: Get recipes based on search criteria
//       description: Retrieve recipes with pagination (5, 10, or 15 results)
//       parameters:
//         - name: limit
//           in: query
//           description: Number of recipes to return (5, 10, or 15)
//           required: true
//           schema:
//             type: integer
//             enum: [5, 10, 15]
//             default: 5
//         - name: query
//           in: query
//           description: Search term for recipe title
//           schema:
//             type: string
//         - name: cuisine
//           in: query
//           description: Filter by cuisine type
//           schema:
//             type: string
//         - name: diet
//           in: query
//           description: Filter by diet type
//           schema:
//             type: string
//         - name: intolerances
//           in: query
//           description: Filter by food intolerances
//           schema:
//             type: string
//         - name: sortBy
//           in: query
//           description: Field to sort results by
//           schema:
//             type: string
//             enum: [readyInMinutes, popularity]
//             default: popularity
//         - name: sortDirection
//           in: query
//           description: Direction of sort
//           schema:
//             type: string
//             enum: [asc, desc]
//             default: desc


router.get( "/", async (req, res, next) => {
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
