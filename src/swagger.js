const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  swaggerDefinition: {
    restapi: "3.0.0",
    info: {
      title: "Envoix-Server",
      version: "1.0.0",
      description: "Envoix API Documentation",
    },
    servers: [
      {
        url: "http://localhost:8000",
      },
    ],
  },
  apis: ["./src/**/*.js"]
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
};
