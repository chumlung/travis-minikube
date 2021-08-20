import {lifeCycleObserver, LifeCycleObserver, service} from '@loopback/core';
import {QueueService} from '../services';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class QueueObserver implements LifeCycleObserver {
  constructor(@service(QueueService) private queueService: QueueService) {}

  /**
   * This method will be invoked when the application initializes. It will be
   * called at most once for a given application instance.
   */
  async init(): Promise<void> {
    // Add your logic for init
  }

  /**
   * This method will be invoked when the application starts.
   */
  async start(): Promise<void> {
    this.queueService.connect();
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    this.queueService.disconnect();
  }
}
