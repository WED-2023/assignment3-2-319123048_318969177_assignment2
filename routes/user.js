var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipes_get_utils = require("./utils/recipes_get_utils");
const recipes_post_utils = require("./utils/recipes_post_utils");

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
    const recipe_id = String(req.body.recipeId);
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
    const recipes_id = await user_utils.getFavoriteRecipes(user_id); //returns the recipes id of the favorite recipes from the DB table
    // #update this function - add to text file for the changes
    const results = await recipes_get_utils.getRecipeDetails(recipes_id,user_id);  
    res.status(200).send(results); // returning the recipes details
  } catch(error){
    console.error("error: ", error);
    next(error); 
  }
});



/**
 * This path returns the recipes of the logged-in user only from DB
 */
router.get('/my_recipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getRecipes(user_id); //returns the recipes ids from the DB table
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into string array 
    const results = await recipes_get_utils.getLocalRecipes(recipes_id_array,user_id); 
    res.status(200).send(results);
  }catch(error){
    console.error("error: ", error);
    next(error);
  }});


/**
 * This path mark a recipe of the logged-in user as viewed
 */
router.post('/:recipeid/viewed', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = String(req.params.recipeid);
    await user_utils.MarkAsVeiwed(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as viewed");
    } catch(error){
    console.error("error: ", error);
    next(error);
  }

});



/**
 * This path returns the 3 my-last-watched reciepes of the logged-in user
 */
router.get('/my-last-watched', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getViewedRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into string array 
    //for each recipe id, we get the recipe details from the DB or spoonacular
    const results = await recipes_get_utils.getRecipeDetails(recipes_id_array,user_id); 
    res.status(200).send(results); // returning the recipes details
  }catch(error){
    console.error("error: ", error);
    next(error);
  }

});

/**
 * This path returns the last search results + the query parameters used.
 */
router.get("/my-last-searches", async (req, res, next) => {
  try {
    if (!req.session || !req.session.user_id) {
      return res.status(401).send("You must be logged in.");
    }

    // Get the latest search for the user
    const sql = `
      SELECT *
      FROM user_search_history
      WHERE user_id = '${req.session.user_id}'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await DButils.execQuery(sql);

    if (result.length === 0) {
      return res.status(200).send([]);
    }

    const lastSearch = result[0];

    // Parse recipe IDs
    const recipeIds = lastSearch.recipe_ids
      ? lastSearch.recipe_ids.split(",").map(id => id.trim()).filter(Boolean)
      : [];

    const recipes = await recipes_get_utils.getRecipeDetails(recipeIds, req.session.user_id);

    // Return both recipes and the original search metadata
    res.status(200).send({
      recipes,
      searchMeta: {
        query: lastSearch.query || "",
        cuisine: lastSearch.selectedCuisine || "",
        diet: lastSearch.selectedDiet || "",
        intolerance: lastSearch.selectedIntolerance || "",
        limit: lastSearch.limit_results || 10,
      }
    });
  } catch (error) {
    next(error);
  }
});



/**
 * This path saves the last search of the logged-in user
 */
router.post("/my-last-searches", async (req, res, next) => {
  try {
    if (!req.session || !req.session.user_id) {
      return res.status(401).send("You must be logged in.");
    }

    const {
      query,
      selectedCuisine,
      selectedDiet,
      selectedIntolerance,
      limit_results,
      sortBy,
      sortDirection,
      recipeIds,
    } = req.body;

    const recipeIdsStr = Array.isArray(recipeIds) ? recipeIds.join(",") : null;
    const sql = `
      INSERT INTO user_search_history 
      (user_id, query, cuisine, diet, intolerance, limit_results, sort_by, sort_direction, recipe_ids) 
      VALUES (
        '${req.session.user_id}',
        '${query}',
        '${selectedCuisine}',
        '${selectedDiet}',
        '${selectedIntolerance}',
        ${limit_results},
        '${sortBy}',
        '${sortDirection}',
        '${recipeIdsStr}'
      );
    `;

    await DButils.execQuery(sql);

    res.status(201).send({ success: true, message: "Search saved" });

  } catch (error) {
    next(error);
  }
});



/**
 * This path returns the my-family reciepes of the logged-in user
 */

router.get('/my_family', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFamilyRecipes(user_id); // get the recipe ids of the family recipes from the DB table
    if (!recipes_id) {  
      return res.status(404).send({ message: "No family recipes found." });
    }
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into string array 
    //for each recipe id, we get the recipe details from the DB or spoonacular
    const results = await recipes_get_utils.getLocalRecipes(recipes_id_array,user_id); 
    res.status(200).send(results); // returning the recipes details
  }catch(error){
    console.error("error: ", error);
    next(error);
  }

});


  /**
   * This path create recipe 
   */
  router.post('/my_recipes', async (req,res,next) => {
    try{
      const user_id = req.session.user_id;
      let recipe_details = {
      title: req.body.title,
      image: req.body.image,
      readyInMinutes: req.body.readyInMinutes,
      popularity: req.body.popularity, 
      isvegan: req.body.isvegan,
      isvegetarian: req.body.isvegetarian,
      isglutenFree: req.body.isglutenFree,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      servings: req.body.servings,
      createrBy: user_id,
      isFamily: req.body.isFamily,
      familyMember: req.body.familyMember,
      occusion: req.body.occusion
      }
      const recipe_id = await recipes_post_utils.createRecipe(user_id,recipe_details); // create the recipe in the DB
      res.status(200).send("The Recipe successfully saved");
    }catch(error){
      console.error("error: ", error);
      next(error);
    }
  });


module.exports = router;
