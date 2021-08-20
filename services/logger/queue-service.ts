import {
  Channel,
  connect as amqpConnect,
  Connection,
  Message,
} from "amqplib/callback_api";
import { severityList } from "./logging-service";

export class QueueService {
  constructor(action: Function) {
    this.action = action;
  }

  private connectionAttempts: number = 0;
  private connection: Connection;
  private channel: Channel;
  private microServiceExchange: string;
  private action: Function;

  public connect() {
    amqpConnect(
      process.env.RABBIT_URL ?? "amqp://localhost",
      { name: "library" },
      (err: any, conn: Connection) => {
        if (err != null) {
          console.log("Could not connect to queue service. Error: ", err);
          if (this.connectionAttempts < 5) {
            console.log(
              "5 unsuccessfull attempts to connect to Queue server. Has queue been started?"
            );
          } else {
            console.log(
              "Please, make sure queue server is initialized and that connection is set properly."
            );
            return;
          }
          console.log("Retrying connection in 5 seconds");
          this.connectionAttempts++;
          setTimeout(() => this.connect(), 5000);
        } else {
          this.connection = conn;
          this.loadChannel()
            .then(() => {
              this.loadQueues();
            })
            .catch((e: Error) => {
              console.log("err", e);
            });

          console.log("Connected to queue server successfully!");
        }
      }
    );
  }

  public disconnect() {
    this.connection.close((err) => {
      if (err) {
        console.log(
          "Error while trying to close the connection with the Queue. Error: ",
          err
        );
      } else {
        console.log("Disconnected to the queue service successfully.");
      }
    });
  }

  private loadChannel() {
    return new Promise((res, rej) => {
      this.connection.createChannel((err: any, channel: Channel) => {
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

  private loadQueues() {
    var exchange = "logs";
    //TODO: Setup exchanges accordingly
    //TODO: Create as many action types as needed

    this.channel.assertQueue(
      "",
      {
        exclusive: true,
      },
      (error2, q) => {
        if (error2) {
          throw error2;
        }
        console.log(
          " [*] Waiting for messages in %s. To exit press CTRL+C",
          q.queue
        );
        this.channel.bindQueue(q.queue, exchange, "");

        this.channel.consume(
          q.queue,
          (msg) => {
            if (msg?.content) {
              this.action(msg?.content.toString(), severityList.info);
            }
          },
          {
            noAck: true,
          }
        );
      }
    );
  }
}
