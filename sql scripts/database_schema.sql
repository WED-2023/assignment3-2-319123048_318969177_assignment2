USE mydb;
-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(8) NOT NULL UNIQUE,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
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
CREATE TABLE user_search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    query VARCHAR(255),
    cuisine VARCHAR(100),
    diet VARCHAR(100),
    intolerance VARCHAR(100),
    limit_results INT,
    sort_by VARCHAR(100),
    sort_direction VARCHAR(10),
    recipe_ids TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS recipe_likes (
    recipe_id VARCHAR(255) NOT NULL PRIMARY KEY,
    likes_count INT NOT NULL DEFAULT 0
);
