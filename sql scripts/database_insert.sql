-- INSERT INTO users (username, firstname, lastname, country, password, email, profilePic)
-- VALUES
-- ('noa123', 'Noa', 'Patchornik', 'Israel', 'SuperSecure123!', 'noa@example.com', 'https://example.com/noa.jpg'),
-- ('yakin', 'Yaki', 'Naftali', 'Israel', 'What?2', 'yakin@example.com', 'https://example.com/yaki.jpg');
-- ('nat30' , 'Neta', 'Patchornik', 'Israel', 'Beach30!', 'neta30@example.com', 'https://example.com/neta.jpg')

-- To users table use PostMan with url /auth/register
-- Spoonacular API example of recipes for pasta
-- {
--     "id": 642583,
--     "title": "Farfalle with Peas, Ham and Cream",
--     "image": "https://img.spoonacular.com/recipes/642583-312x231.jpg",
--     "imageType": "jpg"
-- },
-- {
--     "id": 715538,
--     "title": "What to make for dinner tonight?? Bruschetta Style Pork & Pasta",
--     "image": "https://img.spoonacular.com/recipes/715538-312x231.jpg",
--     "imageType": "jpg"
-- },
-- {
--     "id": 650126,
--     "title": "Linguine E Americana",
--     "image": "https://img.spoonacular.com/recipes/650126-312x231.jpg",
--     "imageType": "jpg"
-- },
-- {
--     "id": 634629,
--     "title": "Beef Lo Mein Noodles",
--     "image": "https://img.spoonacular.com/recipes/634629-312x231.jpg",
--     "imageType": "jpg"
-- }



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


INSERT INTO user_searches (user_id, recipe_id, search_query, search_timestamp)
VALUES
(2, '1ID', 'vegan pasta', NOW()),
(1, '2ID', 'cookies', NOW() - INTERVAL 1 DAY),
(2, '3ID', 'shakshuka', NOW() - INTERVAL 2 DAY),
(3, '4ID', 'chocolate brownies', NOW() - INTERVAL 3 DAY);


INSERT INTO recipe_likes (recipe_id, likes_count) VALUES
('716429', 209);
