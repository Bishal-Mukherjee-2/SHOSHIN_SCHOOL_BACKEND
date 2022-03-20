import throng from "throng";
import mongoose from "mongoose";
import connectDB from "../config/db";

const WORKERS = process.env.IMPORT_WORKER_CONCURRENCY || 1;

import AMQP from "../helpers/AMQP";
import { allQueues } from "./allQueues";
import EventEmitterHelper from "../helpers/EventEmitter";

/**
 *
 * @param {String} id Node.js cluster worker ID provided by throng.
 * @description Function called by each worker started by throng.
 * 1. Establishes connection to RabbitMQ and MongoDB server.
 * 2. Start RabbitMQ Workers on each Cadence Queue.
 * 3. Create handler for 'SIGTERM' signal.
 */
async function start(id: any) {
  console.log("[SERVER:Consumer] Starting import queue worker: ", id);

  const AMQP_URI = process.env.CLOUDAMQP_URL || "amqp://localhost";
  if (process.env.NODE_ENV !== "test") await connectDB();

  const publishAMQPManager = new AMQP(AMQP_URI);

  const publishConn = await publishAMQPManager.establishConnection();

  const consumerAMQPManager = new AMQP(AMQP_URI);

  const conn = await consumerAMQPManager.establishConnection();

  const publishChannel = await publishAMQPManager.createChannelOnConnection(
    publishConn.connection
  );

  await EventEmitterHelper.registerEvent(conn.connection);

  const consumerCreators = [allQueues];

  consumerCreators.forEach((creator) =>
    creator(consumerAMQPManager, publishChannel)
  );

  process.on("SIGTERM", () => handleTermination(id));

  return conn.connection;
}

/**
 *
 * @param {String} id Gracefully handle SIGTERM
 */
async function handleTermination(id: any) {
  console.log(
    `[SERVER:Consumer] Process (${process.pid}) running Worker (${id}) received SIGTERM.`
  );
  console.log(
    `[SERVER:Consumer] Gracefully terminating process (${process.pid}).`
  );
  mongoose.disconnect().finally(() => process.exit(0));
  process.exit(0);
}

if (process.env.IGNORE_THRONG) {
  start(1);
} else {
  throng({
    workers: WORKERS,
    lifetime: Infinity,
    master: function () {
      console.log("[SERVER:Consumer] Master worker started.");
    },
    start: start,
  });
}
