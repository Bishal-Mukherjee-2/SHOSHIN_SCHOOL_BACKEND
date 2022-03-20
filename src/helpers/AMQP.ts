import amqp, {
  Connection,
  ConfirmChannel,
  Channel,
  Message,
  Options,
} from "amqplib";
import Bluebird from "bluebird";

import { Log } from "../utilities/debug";

export let AMQP_GLOBAL_CHANNEL: ConfirmChannel;
export let AMQP_LOGGER_CHANNEL: ConfirmChannel;

interface EstablishConnectionOptions {
  ctx?: string;
}

interface CreateConsumerOptions {
  queueName: string;
  consumerFlag?: string;
  exchange?: string | string[];
  routingKey?: string;
  prefetch?: number;
  assertQueueOptions?: Options.AssertQueue;
}

type MessageHandler = (msg: Message) => void;

interface AMQPHandler {
  ch: Channel;
  consumer: (ch: Channel, options: CreateConsumerOptions) => MessageHandler;
  options: CreateConsumerOptions;
}

export default class AMQP {
  uri: string;

  connection: Connection;

  /** Consumer stuff */
  isConsumer: boolean = false;
  handlers: AMQPHandler[] = [];

  constructor(uri: string) {
    this.uri = uri;
  }

  private connect(): any {
    Log.info("[AMQP] Establishing connection to rabbitmq server.");

    return amqp.connect(this.uri);
  }

  private assertConsumer(ch: Channel, options: CreateConsumerOptions) {
    const exchange = options.exchange;
    const queueName = options.queueName;
    if (exchange && exchange instanceof Array && exchange.length) {
      exchange.forEach(function (name) {
        return ch
          .assertExchange(name, "topic", { durable: true })
          .catch(() => {});
      });
    } else if (typeof exchange === "string") {
      ch.assertExchange(exchange, "topic", { durable: true }).catch(() => {});
    }
    return ch
      .assertQueue(queueName, options.assertQueueOptions)
      .then(function (q: { queue: string }) {
        if (
          exchange &&
          exchange instanceof Array &&
          exchange.length &&
          options.routingKey
        ) {
          exchange.forEach(function (name) {
            return ch
              .bindQueue(q.queue, name, options.routingKey || "")
              .catch(() => {});
          });
        } else if (typeof exchange === "string" && options.routingKey) {
          return ch
            .bindQueue(q.queue, exchange, options.routingKey)
            .catch(() => {});
        }
      });
  }

  /* istanbul ignore next */
  isConnectionAvailable() {
    return Boolean(this.connection);
  }

  createConsumer(
    options: CreateConsumerOptions,
    consumer: (ch: Channel, options: CreateConsumerOptions) => MessageHandler
  ): any {
    if (!options.queueName) {
      return Promise.reject(
        new Error("Provide a queue to consumer on using `options.queueName`.")
      );
    }

    let channelAvailable = true;

    const retry = (ms: number) =>
      setTimeout(() => {
        Log.info("Retrying creation of consumers for", options.queueName);
        return this.createConsumer(options, consumer);
      }, ms);

    return this.connection.createChannel().then((ch: amqp.Channel) => {
      ch.prefetch(options.prefetch || 100);

      (ch as any).isOpen = () => channelAvailable;

      return this.assertConsumer(ch, options)
        .then(() => {
          const handler = consumer(ch, options);

          ch.on("close", () => {
            channelAvailable = false;
            retry(5000);
          });

          const idx = this.handlers.findIndex(
            (handler) => handler.options.queueName === options.queueName
          );
          if (idx > -1) this.handlers.splice(idx, 1);

          this.handlers.push({
            ch,
            consumer,
            options,
          });

          this.isConsumer = true;

          return ch
            .consume(options.queueName, (msg: amqp.Message | null) => {
              if (msg !== null) {
                return handler(msg);
              }
            })
            .then(() => {});
        })
        .catch((err: any) => {
          Log.error(err);
          ch.nackAll(true);
          return ch.close();
        });
    });
  }

  async removeConsumer(queueName: string) {
    let idx = -1;
    let i = 0;
    for (const handler of this.handlers) {
      if (handler.options.queueName === queueName) {
        idx = i;
        await handler.ch.close();
      }
      ++i;
    }
    if (idx > -1) this.handlers.splice(idx, 1);
  }

  establishConnection(
    options: EstablishConnectionOptions = {}
  ): Bluebird<{ connection: amqp.Connection }> {
    const { ctx = "Application" } = options;
    return this.connect().then((connection: amqp.Connection) => {
      connection.on("close", (err) => {
        if (err) {
          Log.info(
            "[RMQ_CONNECTION_EVENT] " +
              ctx +
              " received the close event with an error."
          );
          Log.error(err);

          setTimeout(() => {
            Log.info("Reconnecting to RabbitMQ server");

            this.connection.removeAllListeners();

            this.establishConnection(options);
          }, 3000);
        } else {
          Log.info(
            "[RMQ_CONNECTION_EVENT] " + ctx + " received the close event."
          );
        }
      });

      connection.on("error", (err) => {
        Log.error(
          "[RMQ_CONNECTION_EVENT] " +
            ctx +
            " received the error event with an error."
        );
        Log.error(err);
      });

      connection.on("blocked", (reason) => {
        Log.error(
          "[RMQ_CONNECTION_EVENT] " + ctx + " received the blocked event."
        );
        Log.error("Reason: ", reason);
      });

      connection.on("unblocked", () => {
        Log.error(
          "[RMQ_CONNECTION_EVENT] " + ctx + " received the unblocked event."
        );
      });

      this.connection = connection;
      Log.info("[AMQP] Succesfully established connection to RabbitMQ server.");

      return connection
        .createConfirmChannel()
        .then((channel: amqp.ConfirmChannel) => {
          AMQP_GLOBAL_CHANNEL = channel;
          return { connection };
        });
    });
  }

  createChannelOnConnection(connection: Connection): any {
    return connection.createConfirmChannel();
  }

  /* Returns express middleware that
	adds the connection object to `req.amqp` */
  inject() {
    return (req: { amqp: amqp.Connection }, res: any, next: () => void) => {
      req.amqp = this.connection;
      next();
    };
  }
}

export function inject(conn: { connection: Connection }) {
  return function (req: { amqp: amqp.Connection }, res: any, next: () => void) {
    req.amqp = conn.connection;
    next();
  };
}

/* istanbul ignore next: Add unit-test for this when logger is used in application. */
export function getGlobalChannel(): ConfirmChannel {
  return AMQP_GLOBAL_CHANNEL;
}

export function getChannelForLogger(): ConfirmChannel {
  return AMQP_LOGGER_CHANNEL;
}
