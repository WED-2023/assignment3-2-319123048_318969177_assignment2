# Project - Assignment 3.2 

## Server Side

**Submitters**:
* Noa Patchornik - 319123048  
* Yaki Naftali - 318969177

## Project Overview

* In our database, we decided to store recipe IDs as strings in a specific format: a numeric prefix followed by the suffix "ID" (e.g., "1ID", "2ID"..). This approach allows us to easily distinguish between recipes that originate from our own database and those fetched from the external Spoonacular API.
The prefix numbers are assigned sequentially to ensure uniqueness and maintain order.

* All API requests should begin with `api/`, followed by the required resource path: `auth`, `recipes`, `users`, and then the specific action.

* For better readability and modularity, we split the recipe utility functions into two files:
  - `recipes_get_utils.js` – contains all recipe retrieval functions.
  - `recipes_post_utils.js` – contains all functions related to recipe creation and database updates.

* We added a `JSON_example.txt` file for JSON examples to Postman.

* We used MySQL as our database. To create tables and insert initial data, we provided `.sql` scripts located in the `sql_scripts` directory.  
  For inserting users, we used Postman and sent a request to: `api/auth/register`.


* `API_changes.txt` – a log file describing the changes made to the OpenAPI (YAML) specification since Assignment 3.1.

* We added our OpenAPI definition file (`openapi.yaml`) to the `dist/` directory so we could load it into Swagger and verify our server’s implementation matches the spec.

---
## Database Schema Overview

The server uses a MySQL database with the following key tables:

| Table Name         | Description |
|--------------------|-------------|
| `users`            | Stores all registered users. The `username` field is **unique** and serves as a user identifier. |
| `recipes`          | Stores user-created recipes (including family recipes). Recipes created by users have IDs in the format: `<number>ID` (e.g., `1ID`, `2ID`) to distinguish them from Spoonacular recipes. |
| `ingredients`      | Lists ingredients for each recipe, linked by `recipe_id`. |
| `FavoriteRecipes`  | Tracks which recipes (user-created or Spoonacular) a user has marked as favorites. |
| `viewed_recipes`   | Records which recipes (user-created or Spoonacular) each user has viewed, including timestamps. |
| `user_search_history` | Logs each search made by a user, including query, filters, sorting options, and recipe IDs returned in the results. |
| `recipe_likes`     | Tracks the number of likes per recipe (both user and Spoonacular). |

---

## List of API Endpoints 
#### examples for all JSONs are in the file:  `JSON_example.js` 

### Authorization
* `POST /api/auth/register` – body should contain a JSON object with the new user's details.  
* `POST /api/auth/login` – body should contain a JSON object with `username` and `password`.  
* `POST /api/auth/logout`

---

### User

> ⚠️ All endpoints in this section are available **only for registered and logged-in users**.  
> Session cookies must be included in the requests.

* `GET /api/users/my_favorites`  
* `POST /api/users/my_favorites` – body should contain a JSON object with a recipe ID.  
* `GET /api/users/my_recipes`  
* `POST /api/users/my_recipes` – body should contain a JSON object with all the recipe details.  
* `POST /api/users/{recipeID}/viewed` – path parameter: `recipeID`  
* `GET /api/users/my-last-watched`
* `GET /api/users/watched`  
* `GET /api/users/my-last-searches`
* `POST /api/users/my-last-searches` 
* `GET /api/users/my_family`

---

### Recipes

* `GET /api/recipes` – supports the following optional query parameters:
  - `limit` – default is 5  
  - `query` – required  
  - `cuisine`, `diet`, `intolerances`  
  - `sortBy` – `readyInMinutes` or `popularity` - default `popularity`  
  - `sortDirection` – `asc` or `desc` - defaule `desc`

* `GET /api/recipes/random`

* `GET /api/recipes/{recipeID}` – path parameter: `recipeID`

* `POST /api/recipes/{recipeID}/like` – path parameter: `recipeID`
* `GET /api/recipes/:recipid/likes` - path parameter: `recipid`
* `GET /api/recipes/:id/similar` - path parameter `id` 



## 📦 Project directories structure
```
.
├── routes/                           # Entry points for API endpoints
│   ├── auth.js                       # Authentication: register, login, logout
│   ├── users.js                      # User actions: favorites, viewed, history
│   ├── recipes.js                    # Logic for recipe search & access
│   │
│   ├── utils/
│   │   ├── recipes_get_utils.js      # Handles fetching recipes
│   │   ├── recipes_post_utils.js     # Handles changings in DB recipes
│   │   └── users_utils.js            # Logic for user-related actions
│   │   └── DButils.js               
│   │   └── MySql.js                  # Connection to MySql DB
│
├── sql_scripts/                      # Create DB tables and insert data
├── dist/                             # Connection to Swagger API 
│
├── .env                              # Server credentials, DB connection and Spoonacular key
├── API_changes.txt                   # Manual log of OpenAPI spec changes from 3.1
├── JSON_example.txt                  # JSON examples for testing via Postman
├── package.json                      # Project metadata & dependencies
├── main.js                           # Main Express app entry point
└── server_connection.js              # Server in remote mode
```