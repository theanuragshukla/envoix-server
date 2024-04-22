# Envoix-server
This repository contains server code for the npm package [envoix](https://github.com/theanuragshukla/envoix). 

# Tech Stack
- NodeJS (RTE)
- Postgres (Database)
- TypeORM (ORM)
- ExpressJS (web server)
- Bcrypt + crypto (security)

# Endpoints
- /
- /auth
  - POST /signup
  - POST /login
  - GET /me
- /envs
  - /all
  - /add
  - /:env_id
  - /:env_id/update
  - /:env_id/delete
