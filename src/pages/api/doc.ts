import { withSwagger } from "next-swagger-doc";

const swaggerHandler = withSwagger({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DFDS Mock API",
      description:
        "Swagger API Documentation for Mock API",
      version: "0.1.0",
    },
  },
  apiFolder: "src/pages/api",
});
export default swaggerHandler();