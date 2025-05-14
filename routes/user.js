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
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send({ message: "The Recipe successfully saved as favorite", success: true });
  } catch(error){
    next(error);
  }
});

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

/**
 * Returns the user's last viewed recipes
 */
router.get('/my-last-watched', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const results = await user_utils.getLastViewedRecipes(user_id, 3); // Retrieve last 3 viewed recipes
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * Returns the user's personal recipes
 */
router.get('/my_recipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes = await user_utils.getUserRecipes(user_id);
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * Returns the user's family recipes
 */
router.get('/my_family', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes = await user_utils.getFamilyRecipes(user_id);
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * Mark a recipe as viewed
 */
router.post('/:recipeId/viewed', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;
    await user_utils.markAsViewed(user_id, recipe_id);
    res.status(200).send({ 
      recipeId: recipe_id,
      viewed: true 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get user's last searches
 */
router.get('/my-last-searches', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const searches = await user_utils.getLastSearches(user_id);
    res.status(200).send(searches);
  } catch (error) {
    next(error);
  }
});

module.exports = router;