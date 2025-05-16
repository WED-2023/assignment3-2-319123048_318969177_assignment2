var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/my_favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    console.error("error: ", error);
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/my_favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id); //returns the recipes id of the favorite recipes
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    //for each recipe id, we get the recipe details from the DB or the API of spoonacular
    const results = await recipe_utils.getRecipesPreview(recipes_id_array); 
    res.status(200).send(results); // returning the recipes details
  } catch(error){
    console.error("error: ", error);
    next(error); 
  }
});



/**
 * This path returns the recipes of the logged-in user
 */
router.get('/my_recipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    console.error("error: ", error);
    next(error); 
  }
});


/**
 * This path mark a recipe of the logged-in user as viewed
 */
router.post('/{recipeid}/viewed', async (req,res,next) => {

});



/**
 * This path returns my-last-watched reciepes of the logged-in user
 */
router.get('/my-last-watched', async (req,res,next) => {

});


/**
 * This path return the my-last-searches reciepes of the logged-in user
 */
router.get('/my-last-searches', async (req,res,next) => {

});

/**
 * This path returns the my-family reciepes of the logged-in user
 */

router.get('/my_family', async (req,res,next) => {

});

module.exports = router;
