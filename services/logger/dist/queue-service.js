"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const callback_api_1 = require("amqplib/callback_api");
const logging_service_1 = require("./logging-service");
class QueueService {
    constructor(action) {
        this.connectionAttempts = 0;
        this.action = action;
    }
    connect() {
        var _a;
        callback_api_1.connect((_a = process.env.RABBIT_URL) !== null && _a !== void 0 ? _a : "amqp://localhost", { name: "library" }, (err, conn) => {
            if (err != null) {
                console.log("Could not connect to queue service. Error: ", err);
                if (this.connectionAttempts < 5) {
                    console.log("5 unsuccessfull attempts to connect to Queue server. Has queue been started?");
                }
                else {
                    console.log("Please, make sure queue server is initialized and that connection is set properly.");
                    return;
                }
                console.log("Retrying connection in 5 seconds");
                this.connectionAttempts++;
                setTimeout(() => this.connect(), 5000);
            }
            else {
                this.connection = conn;
                this.loadChannel()
                    .then(() => {
                    this.loadQueues();
                })
                    .catch((e) => {
                    console.log("err", e);
                });
                console.log("Connected to queue server successfully!");
            }
        });
    }
    disconnect() {
        this.connection.close((err) => {
            if (err) {
                console.log("Error while trying to close the connection with the Queue. Error: ", err);
            }
            else {
                console.log("Disconnected to the queue service successfully.");
            }
        });
    }
    loadChannel() {
        return new Promise((res, rej) => {
            this.connection.createChannel((err, channel) => {
                if (err) {
                    throw err;
                }
                this.channel = channel;
                var exchange = "logs";
                channel.assertExchange(exchange, "fanout", {
                    durable: false,
                });
                res(true);
            });
        });
    }
    loadQueues() {
        var exchange = "logs";
        //TODO: Setup exchanges accordingly
        //TODO: Create as many action types as needed
        this.channel.assertQueue("", {
            exclusive: true,
        }, (error2, q) => {
            if (error2) {
                throw error2;
            }
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
            this.channel.bindQueue(q.queue, exchange, "");
            this.channel.consume(q.queue, (msg) => {
                console.log("message received", msg === null || msg === void 0 ? void 0 : msg.content.toString());
                if (msg === null || msg === void 0 ? void 0 : msg.content) {
                    this.action(msg === null || msg === void 0 ? void 0 : msg.content.toString(), logging_service_1.severityList.info);
                }
            }, {
                noAck: true,
            });
        });
    }
}
exports.QueueService = QueueService;
//# sourceMappingURL=queue-service.js.map