import express, { Express } from "express";
import path from "path";
import http from "http";
import * as config from "./config/index";
import Middleware from "./middleware/middleware";
import mongoose from "mongoose";
import connectDB from "./config/db";
import { shutdown, Log } from "./utilities/debug";
import AMQP from "./helpers/AMQP";
import EventEmitterHelper from "./helpers/EventEmitter";
import ErrorHandlingMiddleware from "./middleware/errorHandling";
import { Server } from "socket.io";
import socket_connection from "./socket-io/socketio";
import helmet from "helmet";
import auth from "./routes/auth";
import admin from "./routes/admin";
const amqp = new AMQP(process.env.CLOUDAMQP_URL || "amqp://localhost");

const app = express();
async function bootstrap(app: Express): Promise<void> {
  // RabbitMQ primary connection
  const conn = await amqp.establishConnection();
  await EventEmitterHelper.registerEvent(conn.connection);
  Middleware(app);
  app.use("/auth", auth);
  app.use("/api", admin);
  //   app.use('/api/v1/groups', group)
  //   app.use('/api/v1/tests', test)

  app.enable("trust proxy");

  app.use("/", express.static(path.join(__dirname, "../react_client/build")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../react_client/build", "index.html"));
  });

  ErrorHandlingMiddleware(app);

  if (process.env.NODE_ENV !== "test") await connectDB();

  const port = config.port;

  app.set("port", port);
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  server.listen(port);

  server.on("listening", () => {
    socket_connection({ io });
    Log.info(`🚀  Server is listening on port ${port}`);
  });

  process.on("SIGINT", () => {
    mongoose.disconnect().finally(() => process.exit(0));
  });
}
export default bootstrap(app).catch((err) =>
  shutdown(err, "bootstraping error")
);
