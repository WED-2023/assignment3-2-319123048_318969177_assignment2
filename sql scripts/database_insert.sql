USE mydb
-- To users table use PostMan with url /auth/register


INSERT INTO recipes (
    recipe_id, user_id, title, ready_in_minutes, image, popularity,
    vegan, vegetarian, gluten_free, instructions, servings,
    created_by, is_family, family_member, occasion
)
VALUES
('1ID', 2, 'Noa’s Vegan Pasta', 30, 'https://example.com/pasta.jpg', 50, TRUE, TRUE, TRUE, '["Boil pasta", "Add sauce"]', 2, 'Noa', FALSE, NULL, NULL),
('2ID', 3, 'Grandma’s Cookies', 45, 'https://example.com/cookies.jpg', 80, FALSE, TRUE, FALSE, '["Mix dough", "Bake"]', 12, 'Noa', TRUE, 'Grandma', 'Holiday'),
('3ID', 3, 'Neta’s Shakshuka', 25, 'https://example.com/shakshuka.jpg', 65, FALSE, TRUE, TRUE, '["Cook tomatoes", "Add eggs"]', 4, 'Neta', FALSE, NULL, NULL),
('4ID', 1, 'Yaki’s Brownies', 40, 'https://example.com/brownies.jpg', 90, FALSE, TRUE, FALSE, '["Prepare batter", "Bake"]', 8, 'Yaki', TRUE, 'Mom', 'Birthday');


INSERT INTO ingredients (recipe_id, name, amount, unit)
VALUES
('1ID', 'pasta', 200, 'grams'),
('1ID', 'tomato sauce', 100, 'ml'),
('2ID', 'flour', 2, 'cups'),
('2ID', 'sugar', 1, 'cup'),
('3ID', 'eggs', 2, 'units'),
('3ID', 'tomatoes', 3, 'units'),
('4ID', 'cocoa powder', 0.5, 'cup'),
('4ID', 'butter', 100, 'grams');


INSERT INTO FavoriteRecipes (user_id, recipe_id)
VALUES
(1, '3ID'),
(1, '4ID'),
(2, '1ID'),
(3, '2ID'),
(3, '716429'),
(1, '716429'),
(2, '715538');


INSERT INTO viewed_recipes (user_id, recipe_id)
VALUES
(1, '1ID'),
(1, '2ID'),
(2, '3ID'),
(3, '4ID'),
(3, '716429'),
(1, '716429'),
(2, '715538');


INSERT INTO recipe_likes (recipe_id, likes_count) VALUES
('716429', 209);
