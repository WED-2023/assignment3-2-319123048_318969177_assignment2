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

module.exports = router;
