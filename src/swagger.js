const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Environment Variables Manager API',
      version: '1.0.0',
      description: 'API for managing environment variables with encryption and access control',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        xAuthToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-auth-token',
          description: 'JWT token for authentication',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            uid: {
              type: 'string',
              example: 'abc123',
            },
          },
        },
        Environment: {
          type: 'object',
          properties: {
            env_id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              example: 'Production',
            },
            env_path: {
              type: 'string',
              example: '/path/to/env',
            },
            env_data: {
              type: 'string',
              example: 'encrypted_data',
            },
          },
        },
        Permission: {
          type: 'object',
          properties: {
            user_email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            permission: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['pull', 'push', 'add_user', 'update_user', 'remove_user', 'admin'],
              },
            },
          },
        },
      },
    },
  },
    servers: [
      {
        url: "http://localhost:8000",
      },
    ],
  apis: ["./src/**/*.js"]
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    swaggerOptions: {
      validatorUrl: null,
      displayRequestDuration: true,
    },
  }));
  app.get("/docs-json", (_, res) => { res.json(specs) } );
};
