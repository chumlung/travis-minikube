"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const winston_1 = __importDefault(require("winston"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
require("dotenv").config();
const app = express_1.default();
const port = 3500;
const externalHost = process.env.EXTERNAL_HOST || "http://bl-krakend-cluster-ip:3000";
/**
 * Configure winston
 */
winston_1.default.add(new winston_1.default.transports.Console({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
}));
/**
 * Disable the "try it out" button in swagger
 */
const DisableTryItOutPlugin = () => ({
    statePlugins: {
        spec: {
            wrapSelectors: {
                allowTryItOutFor: () => () => false,
            },
        },
    },
});
/**
 * Swagger options
 */
const options = {
    explorer: true,
    swaggerOptions: {
        plugins: [DisableTryItOutPlugin],
        urls: [
            {
                url: `${externalHost}/courses/documentation`,
                name: "Courses",
            },
        ],
    },
    customCss: ".swagger-ui .topbar .link { display: none }",
};
/**
 * Swagger documentation
 */
app.use("/documentation", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup({}, options));
/**
 * Expose swagger static files
 */
app.use(express_1.default.static("swagger"));
/**
 * Start the server
 */
app.listen(port, () => {
    winston_1.default.info(`Server is running on: http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map