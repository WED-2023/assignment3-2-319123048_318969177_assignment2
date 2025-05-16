var express = require("express");
var router = express.Router();
const recipes_post_utils = require("./utils/recipes_post_utils");
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



module.exports = router;
