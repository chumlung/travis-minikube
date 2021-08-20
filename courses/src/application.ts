import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';


export {ApplicationConfig};

export class coursesApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    // this.bind('queue').toInjectable(BaseQueue)

    // this.service(QueueService)


    //Starting queue services
    // this.queueSetup();
  }

  //  queueSetup(): void{
  //   const rabbit = new Rabbit(process.env.RABBIT_URL ?? 'amqp://host.docker.internal', {
  //     prefetch: 1, //default prefetch from queue
  //     replyPattern: true, //if reply pattern is enabled an exclusive queue is created
  //     scheduledPublish: false,
  //     prefix: '', //prefix all queues with an application name
  //     socketOptions: {} // socketOptions will be passed as a second param to amqp.connect and from ther to the socket library (net or tls)
  //   });

  //   rabbit.on('connected', () => {
  //     console.log("Connected to rabbitMQ successfully")
  //     rabbit.createQueue('family', { durable: false }, (msg: any, ack:any) => {
  //           console.log(msg.content.toString());
  //           ack(null, 'response');
  //         })
  //         .then(() => {
  //           rabbit.publish('family', { test: 'data' }, { correlationId: '1' }).then(() => console.log('message published'));
  //           console.log('queue created')});
  //     //create queues, add halders etc.
  //     //this will be called on every reconnection too
  //   });

  //   rabbit.on('disconnected', (err = new Error('Rabbitmq Disconnected')) => {
  //     //handle disconnections and try to reconnect
  //     console.error(err);
  //     setTimeout(() => rabbit.reconnect(), 100);
  //   })
  // }
}
