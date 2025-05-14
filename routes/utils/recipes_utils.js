const axios = require("axios");
const DButils = require("./DButils");
const api_domain = "https://api.spoonacular.com/recipes";

/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

/**
 * Get recipe information and extract the relevant recipe data
 * @param {*} recipe_id - ID of the recipe to retrieve
 */
async function getRecipeDetails(recipe_id) {
    // Check if recipe is in our database first (personal or family recipe)
    const recipes_from_db = await DButils.execQuery(
        `SELECT * FROM recipes WHERE recipe_id=${recipe_id}`
    );
    
    if (recipes_from_db.length > 0) {
        // Recipe exists in our database
        const recipe = recipes_from_db[0];
        
        // Get ingredients for this recipe
        const ingredients = await DButils.execQuery(
            `SELECT * FROM ingredients WHERE recipe_id=${recipe_id}`
        );
        
        // Format the response to match our API
        return {
            id: recipe.recipe_id,
            title: recipe.title,
            readyInMinutes: recipe.ready_in_minutes,
            image: recipe.image,
            popularity: recipe.popularity,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            glutenFree: recipe.gluten_free,
            ingredients: ingredients,
            instructions: recipe.instructions ? JSON.parse(recipe.instructions) : [],
            servings: recipe.servings,
            isFamily: recipe.is_family,
            familyMember: recipe.family_member,
            occasion: recipe.occasion
        };
    } else {
        // Fetch from Spoonacular API
        let recipe_info = await getRecipeInformation(recipe_id);
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, extendedIngredients, analyzedInstructions, servings } = recipe_info.data;

        // Extract ingredients information
        let ingredients = extendedIngredients.map(ingredient => {
            return {
                name: ingredient.name,
                amount: ingredient.amount,
                unit: ingredient.unit
            };
        });

        // Extract instructions
        let instructions = [];
        if (analyzedInstructions && analyzedInstructions.length > 0) {
            instructions = analyzedInstructions[0].steps.map(step => step.step);
        }

        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            ingredients: ingredients,
            instructions: instructions,
            servings: servings
        };
    }
}

/**
 * Get preview data for several recipes
 * @param {Array} recipes_ids_list - Array of recipe IDs to get preview for
 */
async function getRecipesPreview(recipes_ids_list) {
    let promises = [];
    recipes_ids_list.forEach(id => {
        promises.push(getRecipePreview(id));
    });
    return Promise.all(promises);
}

/**
 * Get preview data for a single recipe
 * @param {*} recipe_id - Recipe ID to get preview for
 */
async function getRecipePreview(recipe_id) {
    // Check if recipe is in our database first
    const recipes_from_db = await DButils.execQuery(
        `SELECT recipe_id, title, ready_in_minutes as readyInMinutes, image, popularity, vegan, vegetarian, gluten_free as glutenFree 
         FROM recipes WHERE recipe_id=${recipe_id}`
    );
    
    if (recipes_from_db.length > 0) {
        // Recipe exists in our database
        return recipes_from_db[0];
    } else {
        // Fetch from Spoonacular API
        let recipe_info = await getRecipeInformation(recipe_id);
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree
        };
    }
}

/**
 * Get random recipes from Spoonacular API
 * @param {number} count - Number of random recipes to retrieve
 */
async function getRandomRecipes(count) {
    try {
        const response = await axios.get(`${api_domain}/random`, {
            params: {
                number: count,
                apiKey: process.env.spooncular_apiKey
            }
        });
        
        const recipes = response.data.recipes;
        return recipes.map(recipe => {
            return {
                id: recipe.id,
                title: recipe.title,
                readyInMinutes: recipe.readyInMinutes,
                image: recipe.image,
                popularity: recipe.aggregateLikes,
                vegan: recipe.vegan,
                vegetarian: recipe.vegetarian,
                glutenFree: recipe.glutenFree
            };
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Search for recipes on Spoonacular API
 * @param {string} query - Search query
 * @param {string} cuisine - Cuisine filter
 * @param {string} diet - Diet filter
 * @param {string} intolerances - Intolerances filter
 * @param {number} limit - Maximum number of results to retrieve
 * @param {string} sortBy - Field to sort results by
 * @param {string} sortDirection - Direction of sort (asc/desc)
 */
async function searchRecipes(query, cuisine, diet, intolerances, limit = 5, sortBy = "popularity", sortDirection = "desc") {
    try {
        const response = await axios.get(`${api_domain}/complexSearch`, {
            params: {
                query: query,
                cuisine: cuisine,
                diet: diet,
                intolerances: intolerances,
                number: limit,
                sort: sortBy,
                sortDirection: sortDirection,
                addRecipeInformation: true,
                apiKey: process.env.spooncular_apiKey
            }
        });
        
        return response.data.results.map(recipe => {
            return {
                id: recipe.id,
                title: recipe.title,
                readyInMinutes: recipe.readyInMinutes,
                image: recipe.image,
                popularity: recipe.aggregateLikes,
                vegan: recipe.vegan,
                vegetarian: recipe.vegetarian,
                glutenFree: recipe.glutenFree
            };
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Save a search to user's search history
 * @param {number} user_id - User ID
 * @param {string} query - Search query
 */
async function saveSearchHistory(user_id, query) {
    try {
        // Delete old searches if there are more than 5
        await DButils.execQuery(`
            DELETE FROM user_searches
            WHERE id IN (
                SELECT id FROM (
                    SELECT id FROM user_searches
                    WHERE user_id=${user_id}
                    ORDER BY search_timestamp DESC
                    LIMIT 10000 OFFSET 5
                ) as temp
            )
        `);
        
        // Insert new search
        await DButils.execQuery(`
            INSERT INTO user_searches (user_id, search_query, search_timestamp)
            VALUES (${user_id}, '${query}', NOW())
        `);
    } catch (error) {
        throw error;
    }
}

/**
 * Mark a recipe as viewed by a user
 * @param {number} user_id - User ID
 * @param {number} recipe_id - Recipe ID
 */
async function markAsViewed(user_id, recipe_id) {
    try {
        // Check if this recipe is already viewed
        const views = await DButils.execQuery(
            `SELECT * FROM viewed_recipes WHERE user_id=${user_id} AND recipe_id=${recipe_id}`
        );
        
        if (views.length === 0) {
            // Insert new view
            await DButils.execQuery(`
                INSERT INTO viewed_recipes (user_id, recipe_id, view_timestamp)
                VALUES (${user_id}, ${recipe_id}, NOW())
            `);
        } else {
            // Update timestamp
            await DButils.execQuery(`
                UPDATE viewed_recipes
                SET view_timestamp = NOW()
                WHERE user_id=${user_id} AND recipe_id=${recipe_id}
            `);
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Create a new recipe
 * @param {Object} recipeData - Recipe data
 */
async function createRecipe(recipeData) {
    try {
        // Insert recipe
        const result = await DButils.execQuery(`
            INSERT INTO recipes (
                title, ready_in_minutes, image, popularity, vegan, vegetarian, gluten_free,
                instructions, servings, user_id, is_family, family_member, occasion
            )
            VALUES (
                '${recipeData.title}', ${recipeData.readyInMinutes}, '${recipeData.image}', 
                ${recipeData.popularity}, ${recipeData.vegan}, ${recipeData.vegetarian}, 
                ${recipeData.glutenFree}, '${JSON.stringify(recipeData.instructions)}', 
                ${recipeData.servings}, ${recipeData.user_id}, ${recipeData.isFamily}, 
                '${recipeData.familyMember || ""}', '${recipeData.occasion || ""}'
            )
        `);
        
        const recipe_id = result.insertId;
        
        // Insert ingredients
        if (recipeData.ingredients && recipeData.ingredients.length > 0) {
            const ingredientValues = recipeData.ingredients.map(ingredient => {
                return `(${recipe_id}, '${ingredient.name}', ${ingredient.amount}, '${ingredient.unit}')`;
            }).join(', ');
            
            await DButils.execQuery(`
                INSERT INTO ingredients (recipe_id, name, amount, unit)
                VALUES ${ingredientValues}
            `);
        }
        
        // Return the newly created recipe
        return await getRecipeDetails(recipe_id);
    } catch (error) {
        throw error;
    }
}

/**
 * Like a recipe - increase its popularity
 * @param {number} recipe_id - Recipe ID
 */
async function likeRecipe(recipe_id) {
    try {
        // Check if recipe exists in our database
        const recipes = await DButils.execQuery(
            `SELECT * FROM recipes WHERE recipe_id=${recipe_id}`
        );
        
        if (recipes.length > 0) {
            // Update popularity
            await DButils.execQuery(`
                UPDATE recipes
                SET popularity = popularity + 1
                WHERE recipe_id=${recipe_id}
            `);
            
            // Return updated popularity
            const updatedRecipes = await DButils.execQuery(
                `SELECT popularity FROM recipes WHERE recipe_id=${recipe_id}`
            );
            
            return updatedRecipes[0].popularity;
        } else {
            // For Spoonacular recipes, we can't update their popularity
            // We could create a local record for external recipe likes
            throw { status: 400, message: "Cannot like external recipes" };
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getRecipeDetails,
    getRecipesPreview,
    getRandomRecipes,
    searchRecipes,
    saveSearchHistory,
    markAsViewed,
    createRecipe,
    likeRecipe
};