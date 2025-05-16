-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(8) NOT NULL UNIQUE,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    profilePic VARCHAR(255)
);

-- Recipes table for user created recipes (both regular and family recipes)
CREATE TABLE IF NOT EXISTS recipes (
    -- auto increment number + string to represent user recipe and not from spoonacular
    recipe_id VARCHAR(255) NOT NULL UNIQUE, 
    user_id INT NOT NULL,
    -- Recipe Overview
    title VARCHAR(255) NOT NULL,
    ready_in_minutes INT NOT NULL,
    image VARCHAR(255),
    popularity INT DEFAULT 0,
    vegan BOOLEAN DEFAULT FALSE,
    vegetarian BOOLEAN DEFAULT FALSE,
    gluten_free BOOLEAN DEFAULT FALSE,
    -- 
    instructions JSON,
    servings INT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    is_family BOOLEAN DEFAULT FALSE,
    family_member VARCHAR(255),
    occasion VARCHAR(255),
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Ingredients table linked to recipes
CREATE TABLE IF NOT EXISTS ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount FLOAT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id)
);

-- FavoriteRecipes table to track user favorites
CREATE TABLE IF NOT EXISTS FavoriteRecipes (
    user_id INT NOT NULL,
    -- can be from spoonacular or user created
    recipe_id VARCHAR(255) NOT NULL, 
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Table to track viewed recipes of each user
CREATE TABLE IF NOT EXISTS viewed_recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id VARCHAR(255) NOT NULL,
    view_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Table to track user searches
CREATE TABLE IF NOT EXISTS user_searches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id VARCHAR(255) NOT NULL,
    search_query VARCHAR(255) NOT NULL,
    search_timestamp DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- -- Insert sample family recipes (optional - for testing)
-- INSERT INTO recipes (
--     title, ready_in_minutes, image, popularity, vegan, vegetarian, gluten_free, 
--     instructions, servings, user_id, is_family, family_member, occasion
-- ) VALUES 
-- (
--     'Grandma\'s Apple Pie', 
--     60, 
--     'https://example.com/apple_pie.jpg', 
--     0, 
--     FALSE, 
--     TRUE, 
--     FALSE, 
--     '[\"Prepare the dough\", \"Peel and slice apples\", \"Mix apples with sugar and cinnamon\", \"Place in pie dish\", \"Bake for 45 minutes\"]', 
--     8, 
--     1, 
--     TRUE, 
--     'Grandma Sarah', 
--     'Family gatherings'
-- ),
-- (
--     'Uncle\'s Chicken Soup', 
--     90, 
--     'https://example.com/chicken_soup.jpg', 
--     0, 
--     FALSE, 
--     FALSE, 
--     TRUE, 
--     '[\"Boil chicken\", \"Add vegetables\", \"Add spices\", \"Simmer for 1 hour\"]', 
--     6, 
--     1, 
--     TRUE, 
--     'Uncle David', 
--     'Winter meals'
-- ),
-- (
--     'Mom\'s Special Cookies', 
--     30, 
--     'https://example.com/cookies.jpg', 
--     0, 
--     FALSE, 
--     TRUE, 
--     FALSE, 
--     '[\"Mix ingredients\", \"Form cookies\", \"Bake for 15 minutes\"]', 
--     24, 
--     1, 
--     TRUE, 
--     'Mom', 
--     'Holidays'
-- );

-- -- Insert sample ingredients for family recipes
-- INSERT INTO ingredients (recipe_id, name, amount, unit) VALUES
-- (1, 'flour', 2, 'cups'),
-- (1, 'apples', 6, 'units'),
-- (1, 'sugar', 1, 'cup'),
-- (1, 'cinnamon', 1, 'teaspoon'),
-- (2, 'chicken', 1, 'whole'),
-- (2, 'carrots', 3, 'units'),
-- (2, 'celery', 2, 'stalks'),
-- (2, 'onion', 1, 'unit'),
-- (3, 'flour', 2, 'cups'),
-- (3, 'sugar', 1, 'cup'),
-- (3, 'butter', 200, 'grams'),
-- (3, 'chocolate chips', 1, 'cup');