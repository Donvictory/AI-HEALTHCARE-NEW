import swaggerJSDoc, { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Healthcare API Explorer",
      version: "1.0.0",
      description: "API documentation for the AI Healthcare backend services",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/modules/**/*.route.ts"], // Adjust path as needed based on execution context
};

export default swaggerJSDoc(options);
