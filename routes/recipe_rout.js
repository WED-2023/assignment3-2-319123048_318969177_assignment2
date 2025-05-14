/**
 * Recipe routes implementation based on the OpenAPI specification
 */
const express = require("express");
const router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

/**
 * Search recipes with filters
 * GET /recipes
 */
router.get("/", async (req, res, next) => {
  try {
    const { limit, query, cuisine, diet, intolerances, sortBy, sortDirection } = req.query;
    
    // Validate limit parameter
    if (limit && ![5, 10, 15].includes(parseInt(limit))) {
      throw { status: 400, message: "Limit must be 5, 10, or 15" };
    }
    
    // Save search to history if user is logged in
    if (req.session && req.session.user_id) {
      await user_utils.saveSearch(req.session.user_id, query);
    }
    
    // Call search function
    const recipes = await recipes_utils.searchRecipes(
      limit, query, cuisine, diet, intolerances, sortBy, sortDirection
    );
    
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new recipe
 * POST /recipes
 */
router.post("/", async (req, res, next) => {
  try {
    // Verify user is authenticated
    if (!req.session || !req.session.user_id) {
      throw { status: 401, message: "Unauthorized" };
    }

    const userId = req.session.user_id;
    
    // Create the recipe
    const recipeId = await recipes_utils.createRecipe(userId, req.body);
    
    // Get the created recipe
    const recipe = await recipes_utils.getRecipeDetails(recipeId);
    
    res.status(201).send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * Get random recipes
 * GET /recipes/random
 */
router.get("/random", async (req, res, next) => {
  try {
    const count = req.query.count || 3; // Default to 3 if not specified
    const recipes = await recipes_utils.getRandomRecipes(count);
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific recipe by ID
 * GET /recipes/:recipeid
 */
router.get("/:recipeid", async (req, res, next) => {
  try {
    const recipeId = req.params.recipeid;
    
    // Get recipe details
    const recipe = await recipes_utils.getRecipeDetails(recipeId);
    
    // Mark as viewed if user is logged in
    if (req.session && req.session.user_id) {
      await user_utils.markAsViewed(req.session.user_id, recipeId);
    }
    
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * Update a recipe
 * PATCH /recipes/:recipeId
 */
router.patch("/:recipeId", async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.user_id) {
      throw { status: 401, message: "Unauthorized" };
    }
    
    const userId = req.session.user_id;
    const recipeId = req.params.recipeId;
    
    // Check if recipe exists and belongs to the user
    const ownership = await recipes_utils.checkRecipeOwnership(userId, recipeId);
    if (!ownership.exists) {
      throw { status: 404, message: "Recipe not found" };
    }
    
    if (!ownership.isOwner) {
      throw { status: 401, message: "Unauthorized - not the recipe owner" };
    }
    
    // Update the recipe
    await recipes_utils.updateRecipe(recipeId, req.body, ownership.isFamily);
    
    // Get updated recipe
    const updatedRecipe = await recipes_utils.getRecipeDetails(recipeId);
    
    res.status(200).send(updatedRecipe);
  } catch (error) {
    next(error);
  }
});

/**
 * Like a recipe
 * PUT /recipes/:recipeid/like
 */
router.put("/:recipeid/like", async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.user_id) {
      throw { status: 401, message: "Unauthorized" };
    }
    
    const userId = req.session.user_id;
    const recipeId = req.params.recipeid;
    
    // Check if recipe exists
    const recipeExists = await recipes_utils.checkRecipeExists(recipeId);
    if (!recipeExists) {
      throw { status: 404, message: "Recipe not found" };
    }
    
    // Add like
    await recipes_utils.likeRecipe(userId, recipeId);
    
    // Get updated popularity count
    const popularity = await recipes_utils.getRecipeLikes(recipeId);
    
    res.status(200).send({ 
      recipeId: parseInt(recipeId),
      liked: true,
      popularity: popularity
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;