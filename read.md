# Movies API (Express + MongoDB)

  

## Setup

1. Copy `.env` and update values.
```bash
PORT=4000
JWT_SECRET= Dev_Secret
JWT_EXPIRES_IN=1d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
USER_EMAIL=vamsi@example.com
USER_PASSWORD=Vamsi@123
MONGO_URL=--cluster_id---/moviesdb
MONGO_USERNAME=iamvamsi999
MONGO_PASSWORD=------
```
3. Install deps:
```bash
npm install
```
# Auth endpoints
• GET /auth/register - to sign up (admin,  user)
• GET /auth/login - to get bearer token
# Movie endpoints
• GET /movies (auth  required) — query: page, limit, genre, minRating, maxRating
• GET /movies/:id (auth  required)
• POST /movies (admin) — body { name,  rating,  genres: ["A","B"], watchedUsers: ["a","b"] }
• PUT /movies/:id (admin)
• DELETE /movies/:id (admin)
• POST /movies/bulk-upload (admin) — form-data file = .xlsx (only xlsx file is uploaded)
• POST /movies/:movie_id/watch/:userid (auth  required) — for addind user to watched_users in movie
• GET /movies/:userId/watched-movies (auth  required) - list of users watched movies
• Excel headers: name | rating | genres | watchedUsers
• For multi-values use comma: Action,Comedy