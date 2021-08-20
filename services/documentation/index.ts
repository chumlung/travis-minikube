import express from 'express'
import winston from 'winston'
import swaggerUi, { SwaggerOptions } from 'swagger-ui-express'
require("dotenv").config();

const app = express();
const port = 3500;

const externalHost = process.env.EXTERNAL_HOST || "http://bl-krakend-cluster-ip:3000";

/**
 * Configure winston
 */
winston.add(
  new winston.transports.Console({
    level: "info",
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
);

// /**
//  * Disable the "try it out" button in swagger
//  */
// const DisableTryItOutPlugin = () => ({
//   statePlugins: {
//     spec: {
//       wrapSelectors: {
//         allowTryItOutFor: () => () => true,
//       },
//     },
//   },
// });

/**
 * Swagger options
 */
const options : SwaggerOptions = {
  explorer: true,
  swaggerOptions: {
    // plugins: [DisableTryItOutPlugin],
    urls: [
      {
        url: `/courses/documentation`,
        name: "Courses",
      },
    ],
  },
  customCss: ".swagger-ui .topbar .link { display: none }",
};

/**
 * Swagger documentation
 */
app.use("/documentation", swaggerUi.serve, swaggerUi.setup({}, options));

/**
 * Expose swagger static files
 */
app.use(express.static("swagger"));

/**
 * Start the server
 */
app.listen(port, () => {
  winston.info(`Server is running on: http://localhost:${port}`);
});
