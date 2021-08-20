// Uncomment these imports to begin using these cool features!

import {service} from '@loopback/core';
import {post, requestBody, response} from '@loopback/rest';
import {QueueService} from '../services';

// import {inject} from '@loopback/core';

type PostMessageType = {
  topic: string,
  message: string|object
}

export class QueueController {
  constructor(
    @service(QueueService)
    private queueService: QueueService
  ) {}

  @post('/queue/post')
  @response(200, {
    description: "Sends a a message in a queue",
    content: {'application/json': {
      schema:{
        type: 'string',
        title: 'Response'
      }
    }}
  })
  async postMessage(
    @requestBody({
      required: true,
      description: 'Object required to post a message to the queue service',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'object',
              },
              topic: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    postMessageData: PostMessageType
  ){
    const serviceResponse = this.queueService.sendMessage(postMessageData.message, postMessageData.topic)
    return{
      Response: serviceResponse ? "Message sent successfully." : "Something wrong happened."
    }
  }
}
