const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Test Backend API",
      version: "1.0.0",
      description: "Dokumentacija za testiranje backend-a",
    },
    servers: [{ url: "http://localhost:5000" }],
  },
  apis: ["./src/routes/*.js"], // gde su tvoje rute
};

const specs = swaggerJsDoc(options);

module.exports = { swaggerUi, specs };
