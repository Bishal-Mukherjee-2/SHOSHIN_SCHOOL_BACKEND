import { Log } from "../utilities/debug";
import mongoose from "mongoose";
import * as config from "./index";
import registerModels from "../models/index";
let database: mongoose.Connection;
const uri = config.nodeEnv !== "dev" ? config.prodMongoUri : config.mongoUri;

const connectDB = async (): Promise<void> => {
  if (database) {
    return;
  }

  //register models before creating connection
  await registerModels();

  const conn = await mongoose.connect(uri);
  Log.info(`[MongoDB] Connected: ${conn.connection.host}`);
  database = mongoose.connection;

  // In case of any error
  database.on("error", () => {
    console.log(`Error connecting to database. Check Whether mongoDB
	installed or you can try to give opensource Mongo Atlas database`);
  });
};

export default connectDB;
