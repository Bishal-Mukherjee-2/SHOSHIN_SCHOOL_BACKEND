import { Message } from "amqplib";
import QueueActionHelper from "../helpers/queueActions";

const runQueueActions = function (
  ch: any,
  msg: any,
  Strategy: any,
  QueueName: any,
  producerChannel: any
) {
  const payload = JSON.parse(msg.content.toString());

  if (payload.type === "SYSTEM") {
    return runSystemActions(ch, msg, Strategy, QueueName);
  }

  let prmGetAction = Promise.resolve();

  return prmGetAction
    .then(function () {
      const strategy = Strategy[payload.action];

      const ActionExecutor = QueueActionHelper.getQueueActionExecutor(
        payload.action,
        payload,
        strategy,
        producerChannel
      );

      return ActionExecutor.exec(ch).then(function () {
        if (ch.isOpen()) {
          ch.ack(msg);
          return Promise.resolve();
        } else {
          console.log(
            "Channel is not open. Will not attempt to acknowledge message."
          );
        }
      });
    })
    .catch(function (err) {
      console.log("====== QUEUE ACTION CATCH =======");
      console.log(err);

      if (ch.isOpen()) {
        ch.reject(msg, true);
        return Promise.reject(err);
      }
    });
};

const runSystemActions = function (
  ch: any,
  msg: any,
  Strategy: any,
  QueueName: any
) {
  let payload = JSON.parse(msg.content.toString());
  let strategy = Strategy[payload.action];
  let actionExecutor = QueueActionHelper.getQueueActionExecutor(
    payload.action,
    payload,
    strategy
  );
  return actionExecutor
    .exec(ch)
    .then(function () {
      ch.ack(msg);
    })
    .catch(function (err: any) {
      console.log(err.stack);
      ch.ack(msg);
    });
};

const consumerActionExecutor = function (Strategy: any, publishChannel: any) {
  return function Consumer(ch: any, createConsumerOptions: any) {
    const { queueName } = createConsumerOptions;

    console.log("Starting consumer for queue:", queueName);

    return function MessageHandler(msg: any) {
      return Promise.resolve()
        .then(() => {
          const payload = JSON.parse(msg.content.toString());

          console.log(
            `[MessageHandler] incoming action=${payload.action} sub_action=${payload.sub_action}`
          );

          return runQueueActions(
            ch,
            msg,
            Strategy,
            queueName,
            publishChannel
          ).catch(function (err: any) {
            console.error(err);
            ch.reject(msg, true);
            return ch.close();
          });
        })
        .catch(function (err) {
          console.error("============ MessageHandler ERROR ============");
          console.error(err);
          console.error("==============================================");
        });
    };
  };
};

const enqueue = function (connection: any, qName: any, payload: any) {
  return Promise.resolve().then(function () {
    console.log(
      `[ENQUEUE][${payload.actionId}] Enqueing - User: ${
        payload.user && payload.user.username ? payload.user.username : "n/a"
      }, queue: ${qName}, action: ${payload.action}, sub_action: ${
        payload.sub_action
      }`
    );

    return connection.createConfirmChannel().then(function (ch: any) {
      const strPayload = JSON.stringify(payload);
      ch.sendToQueue(qName, Buffer.from(strPayload));
      const await = ch.waitForConfirms();

      return await
        .then(function (ok: any) {
          ch.close();
          console.log(
            `[ENQUEUE][${payload.actionId}] Enqueued successfully - User: ${
              payload.user && payload.user.username
                ? payload.user.username
                : "n/a"
            }`
          );
          return Promise.resolve(ok);
        })
        .catch(function (err: any) {
          console.log(
            `[ENQUEUE][${payload.actionId}] Enqueue error - User: ${
              payload.user && payload.user.username
                ? payload.user.username
                : "n/a"
            }`
          );
          console.log(err);
          ch.close();
          return Promise.reject(err);
        });
    });
  });
};

const enqueueSystemJobs = function (connection: any, qName: any, payload: any) {
  return connection.createConfirmChannel().then(function (ch: any) {
    let strPayload = JSON.stringify(payload);
    ch.sendToQueue(qName, Buffer.from(strPayload));
    let await = ch.waitForConfirms();
    return await
      .then(function (ok: any) {
        console.log(ok);
        ch.close();
        return ok;
      })
      .catch(function (err: any) {
        ch.close();
        return Promise.reject(err);
      });
  });
};

const enqueueFromChanel = function (
  ch: any,
  qName: any,
  payload: any,
  queueOptions = {}
) {
  return ch.assertQueue(qName, queueOptions).then(function (ok: any) {
    let strPayload = JSON.stringify(payload);
    return ch.sendToQueue(qName, Buffer.from(strPayload), {
      priority: payload.priority,
    });
  });
};

const readyQueue = function (
  conn: any,
  QueueName: any,
  exchange: any,
  key: any,
  prefetchCount = 100,
  queueOptions = {}
) {
  return conn.createChannel().then(function (ch: any) {
    if (exchange && exchange instanceof Array && exchange.length) {
      exchange.forEach(function (name) {
        ch.assertExchange(name, "topic", { durable: true });
      });
    } else if (typeof exchange === "string") {
      ch.assertExchange(exchange, "topic", { durable: true });
    }

    ch.prefetch(prefetchCount);

    return ch.assertQueue(QueueName, queueOptions).then(function (q: any) {
      if (exchange && exchange instanceof Array && exchange.length) {
        exchange.forEach(function (name) {
          ch.bindQueue(q.queue, name, key);
        });
      } else if (typeof exchange === "string") {
        ch.bindQueue(q.queue, exchange, key);
      }

      return ch;
    });
  });
};

const publishToexchange = function (
  connection: any,
  exchange: any,
  payload: any,
  key: any,
  delay = 10000
) {
  let prmChannel: any,
    isAmqpConnection =
      connection &&
      connection.createConfirmChannel &&
      typeof connection.createConfirmChannel === "function"
        ? true
        : false;

  if (isAmqpConnection) {
    prmChannel = connection.createConfirmChannel();
  } else {
    prmChannel = Promise.resolve(connection);
  }
  return Promise.resolve().then(function name(objAction) {
    return prmChannel.then(function (ch: any) {
      let strPayload = JSON.stringify(payload);

      if (exchange === "shoshin_automation") {
        ch.assertExchange(exchange, "x-delayed-message", {
          durable: true,
          arguments: { "x-delayed-type": "direct" },
        });
        ch.publish(exchange, key, Buffer.from(strPayload), {
          headers: { "x-delay": delay },
        });
      } else {
        ch.assertExchange(exchange, "topic", { durable: true });
        ch.publish(exchange, key, Buffer.from(strPayload));
      }

      let await = ch.waitForConfirms();
      return await
        .then(function (ok: any) {
          if (isAmqpConnection) ch.close();
          return ok;
        })
        .catch(function (err: any) {
          if (isAmqpConnection) ch.close();
          return Promise.reject(err);
        });
    });
  });
};

export default {
  consumerActionExecutor,
  runQueueActions,
  runSystemActions,
  enqueue,
  enqueueSystemJobs,
  enqueueFromChanel,
  readyQueue,
  publishToexchange,
};
