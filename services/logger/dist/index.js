"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue_service_1 = require("./queue-service");
const logging_service_1 = require("./logging-service");
const loggingService = new logging_service_1.LogginService();
function action(message, severity) {
    loggingService.sendMessage(message, severity);
}
// loggingService.sendMessage("YOU GUYS ARE WATCHING MY SCREEN :D", severityList.info)
const queueService = new queue_service_1.QueueService(action);
queueService.connect();
const exitHandler = () => {
    queueService.disconnect();
};
process.stdin.resume();
//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
//# sourceMappingURL=index.js.map