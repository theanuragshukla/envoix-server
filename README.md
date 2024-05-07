# Envoix-server
This repository contains server code for the npm package [envoix](https://github.com/theanuragshukla/envoix). 

# Table of Contents
1. Introduction
2. Tech stack
3. Getting Started
   1. Installation
   2. Configuration
   3. Running the Server
4. API Reference
   1. Authentication Endpoints
   2. Environment Variables Endpoints
   3. Permission Management Endpoints
5. Security Considerations
6. Conclusion

# Tech Stack
- NodeJS (RTE)
- Postgres (Database)
- TypeORM (ORM)
- ExpressJS (web server)
- Bcrypt + crypto (security)

# Introduction

Envoix Server is built using Node.js and Express.js, providing a RESTful API for handling user authentication, environment variables management, and permission management. It leverages PostgreSQL as its database for storing user data, environment variables, and permissions.

# Getting Started
## Installation

To install Envoix Server, follow these steps:

1. Clone the Envoix Server repository:
```bash
git clone https://github.com/your_username/envoix-server.git
```

2. Navigate to the Envoix Server directory:
```bash
cd envoix-server
```

3. Install dependencies:
```bash
npm install
```

4. Configuration

Before running the server, configure the environment variables by copying the .env.example file to .env and providing appropriate values for your environment.
Running the Server

5. To start the Envoix Server, run the following command:
```bash
npm start
```

# API Reference

Envoix Server provides the following endpoints for managing authentication, environment variables, and permissions:

## Authentication Endpoints (/auth)

    POST /auth/signup: Create a new user account.
    POST /auth/login: Authenticate user credentials and generate an access token.
    GET /auth/me: Retrieve user details (requires authentication).

Environment Variables Endpoints (/envs)

    GET /envs: Retrieve all environment variables associated with the authenticated user.
    POST /envs: Add a new environment variable.
    GET /envs/:env_id: Retrieve an environment variable by ID.
    PUT /envs/:env_id: Update an existing environment variable.
    DELETE /envs/:env_id: Delete an environment variable.

Permission Management Endpoints (/permissions)

    POST /permissions/:env_id: Add permissions for accessing an environment variable.
    PUT /permissions/:env_id: Update existing permissions for accessing an environment variable.
    DELETE /permissions/:env_id: Remove permissions for accessing an environment variable.
    GET /permissions/:env_id: Retrieve permissions for an environment variable.

# Security Considerations
    Envoix Server utilizes encryption techniques to ensure the security of sensitive data, such as user passwords and environment variable contents.
    Access to sensitive endpoints and data is restricted based on user authentication and permissions.
    Regularly review and update user permissions to maintain security.
    Avoid sharing sensitive information in environment variables unless necessary.

# Conclusion
Envoix Server provides a robust backend solution for managing environment variables within development teams. By centralizing storage, enforcing encryption, and providing fine-grained access control, Envoix Server enhances collaboration while prioritizing security and simplicity.

# Author
developed by [Anurag Shukla](https://github.com/theanuragshukla)
