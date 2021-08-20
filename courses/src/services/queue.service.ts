/* eslint-disable @typescript-eslint/no-explicit-any */
import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  Channel,
  connect as amqpConnect,
  Connection,
  Message
} from 'amqplib/callback_api';
// import {LibAction} from '../queue-actions';
import {CourseRepository} from '../repositories';

type TopicActionPairType = {
  topic: string;
  action: (msg: Message | null) => void;
};

type QueueHandlerType = {
  exchange: string;
  topicActionPairs: Array<TopicActionPairType>;
};

/*
 * Fix the service type. Possible options can be:
 * - import {Queue} from 'your-module';
 * - export type Queue = string;
 * - export interface Queue {}
 */
export type Queue = unknown;

@injectable({scope: BindingScope.SINGLETON})
export class QueueService {
  constructor(
    @repository(CourseRepository)
    public courseRepository: CourseRepository,
  ) {}
  // public libAction: LibAction
  private connection: Connection;
  private channel: Channel;
  // private exchanges: Array<string>;
  private connectionAttempts = 0;
  private microServiceExchange: string;
  private logsChannel: Channel;

  public connect() {
    amqpConnect(
      process.env.RABBIT_URL ?? 'amqp://localhost',
      {name: 'library'},
      (err: any, conn: Connection) => {
        if (err != null) {
          console.log('Could not connect to queue service. Error: ', err);
          if (this.connectionAttempts < 5) {
            console.log(
              '5 unsuccessfull attempts to connect to Queue server. Has queue been started?',
            );
          } else {
            console.log(
              'Please, make sure queue server is initialized and that connection is set properly.',
            );
            return;
          }
          console.log('Retrying connection in 5 seconds');
          this.connectionAttempts++;
          setTimeout(() => this.connect(), 5000);
        } else {
          this.connection = conn;
          this.loadChannel()
            .then(() => {
              this.loadQueues();
            })
            .catch(e => {
              console.log('err', e);
            });

          console.log('Connected to queue server successfully!');
        }
      },
    );
  }

  private async loadChannel() {
    return new Promise((res, rej) => {
      this.connection.createChannel((err: any, channel: Channel) => {
        if (err) {
          throw err;
        }
        this.channel = channel;

        //TODO: Modify the exchange accordingly
        this.microServiceExchange = 'library';

        // channel.assertExchange(this.microServiceExchange, 'fanout', {
          channel.assertExchange(this.microServiceExchange, 'topic', {
            durable: false,
          });

      });
      this.connection.createChannel((err: any, channel: Channel) => {
        if (err) {
          throw err;
        }
        this.logsChannel = channel;
          channel.assertExchange('logs', 'fanout', {
            durable: false,
          });

        res(true);
      });
    });
  }

  private loadQueues() {
    //TODO: Setup exchanges accordingly
    //TODO: Create as many action types as needed

    this.queueHandlerList.forEach(queueHandler => {
      queueHandler.topicActionPairs.forEach(topicActionPair => {
        this.channel.assertQueue(
          '',
          {
            durable: true,
          },
          (err: any, q: any) => {
            if (err) {
              throw err;
            }
            this.channel.bindQueue(
              q.queue,
              queueHandler.exchange,
              topicActionPair.topic,
            );
            this.channel.consume(q.queue, topicActionPair.action, {
              noAck: false,
            });
          },
        );
      });
    });
  }

  public sendMessage(message: string | Object, key: string) {
    //TODO: Change this accordingly
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }
    this.logsChannel.publish('logs','',Buffer.from(message))
    return this.channel.publish(
      this.microServiceExchange,
      key,
      Buffer.from(message),
    );
  }

  public disconnect() {
    this.connection.close(err => {
      if (err) {
        console.log(
          'Error while trying to close the connection with the Queue. Error: ',
          err,
        );
      } else {
        console.log('Disconnected to the queue service successfully.');
      }
    });
  }

  //TODO: Implement actions
  private queueHandlerList: Array<QueueHandlerType> = [
    {
      exchange: 'library',
      topicActionPairs: [
        {
          topic: 'content.created',
          action: (msg: Message | null) => {
            this.courseRepository.find().then(courses => {
              console.log(
                'I got access to the courses',
                JSON.stringify(courses),
              );
              console.log(
                `Content Created.Do I care about them?\nMessage:${msg?.content.toString()}`,
              );
            });
          },
        },
        {
          topic: 'content.deleted',
          action: (msg: Message | null) => {
            console.log(`Content deleted.\nMessage:${msg?.content.toString()}`);
          },
        },
      ],
    },
  ];

  // value() {
  //   // Add your implementation here
  //   throw new Error('To be implemented');
  // }
}
