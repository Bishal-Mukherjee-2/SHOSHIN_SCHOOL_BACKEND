import * as config from "../config";
import morgan from "morgan";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { passportAuth } from "./passport";
import { authenticate } from "passport";
import { passportLocalAuth } from "./passportLocal";

export default function CommonMiddleware(app: Express): void {
  passportAuth(passport);
  passportLocalAuth(passport);
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));
  app.use(
    cors({
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    })
  );
  //   app.use(helmet());
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(morgan(config.nodeEnv === "dev" ? "dev" : "common"));
  app.use(
    session({
      secret: "keyboard cat",
      cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: config.mongoUri,
      }),
    })
  );
  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
}
