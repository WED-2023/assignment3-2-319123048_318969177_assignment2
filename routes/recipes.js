var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

/**
 * This route returns the homepage recipes:
 * 3 random recipes and the 3 last viewed recipes by the user (if logged in)
 */
router.get("/random", async (req, res, next) => {
  try {
    // Get 3 random recipes from Spoonacular API
    const count = req.query.count || 3; // Default to 3 if not specified
    const randomRecipes = await recipes_utils.getRandomRecipes(count);
    res.send(randomRecipes);
  } catch (error) {
    next(error);
  }
});

/**
 * Search for recipes based on various criteria
 */
router.get("/search", async (req, res, next) => {
  try {
    const { query, cuisine, diet, intolerances, limit = 5, sortBy, sortDirection } = req.query;
    
    // Search recipes with specified parameters
    const recipes = await recipes_utils.searchRecipes(
      query,
      cuisine,
      diet,
      intolerances,
      limit,
      sortBy,
      sortDirection
    );
    
    // If user is logged in, store the search in their search history
    if (req.session && req.session.user_id) {
      await recipes_utils.saveSearchHistory(req.session.user_id, query);
    }
    
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    // Mark as viewed if user is logged in
    if (req.session && req.session.user_id) {
      await recipes_utils.markAsViewed(req.session.user_id, req.params.recipeId);
    }
    
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new recipe (regular or family recipe)
 */
router.post("/", async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.session || !req.session.user_id) {
      res.status(401).send({ message: "User not authenticated", success: false });
      return;
    }
    
    const recipeData = {
      title: req.body.title,
      readyInMinutes: req.body.readyInMinutes,
      image: req.body.image,
      popularity: 0, // New recipes start with 0 popularity
      vegan: req.body.vegan || false,
      vegetarian: req.body.vegetarian || false,
      glutenFree: req.body.glutenFree || false,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      servings: req.body.servings,
      user_id: req.session.user_id,
      isFamily: req.body.isFamily || false,
      familyMember: req.body.familyMember,
      occasion: req.body.occasion
    };
    
    const createdRecipe = await recipes_utils.createRecipe(recipeData);
    res.status(201).send({ 
      message: "Recipe created successfully", 
      success: true,
      recipe: createdRecipe
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Like a recipe - increase its popularity
 */
router.put("/:recipeId/like", async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.session || !req.session.user_id) {
      res.status(401).send({ message: "User not authenticated", success: false });
      return;
    }
    
    const recipeId = req.params.recipeId;
    const updatedPopularity = await recipes_utils.likeRecipe(recipeId);
    
    res.status(200).send({
      recipeId: recipeId,
      liked: true,
      popularity: updatedPopularity
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;