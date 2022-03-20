import QueueLib from "../library/queue";
import { QUEUES } from "../constants/index";
import AMQP from "../helpers/AMQP";
import Strategy from "./queueStrategy";

export const allQueues = (amqpManager: AMQP, publishChannel: any) => {
  const queues = [QUEUES.CODE_EXECUTION];

  queues.forEach((queue) => {
    const options = {
      queueName: queue,
      prefetch: 100,
      // assertQueueOptions: {
      // 	maxPriority: 10
      // }
    };

    amqpManager.createConsumer(
      options,
      QueueLib.consumerActionExecutor(Strategy, publishChannel)
    );
  });
};
