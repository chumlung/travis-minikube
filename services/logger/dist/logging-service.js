"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogginService = exports.severityList = void 0;
const winston_1 = __importDefault(require("winston"));
// Loggin Levels
var severityList;
(function (severityList) {
    severityList["emerg"] = "emerg";
    severityList["alert"] = "alert";
    severityList["crit"] = "crit";
    severityList["error"] = "error";
    severityList["warning"] = "warning";
    severityList["notice"] = "notice";
    severityList["info"] = "info";
    severityList["debug"] = "debug";
})(severityList = exports.severityList || (exports.severityList = {}));
class LogginService {
    constructor() {
        var _a;
        const papertrail = new winston_1.default.transports.Http({
            host: "logs.collector.solarwinds.com",
            path: "/v1/log",
            auth: {
                username: " ",
                password: (_a = process.env.PAPER_TRAIL_TOKEN) !== null && _a !== void 0 ? _a : "ZxIOYxe2Es1XO4oY1iemxeB8TmW8",
            },
            ssl: true,
        });
        const logger = winston_1.default.createLogger({
            transports: [papertrail],
        });
        this.papertrail = papertrail;
        this.logger = logger;
    }
    sendMessage(message, severity) {
        this.logger.log({ level: severity, message: JSON.stringify(message) });
    }
}
exports.LogginService = LogginService;
//# sourceMappingURL=logging-service.js.map