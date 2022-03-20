const GoogleStrategy = require("passport-google-oauth20").Strategy;
import { PassportStatic } from "passport";
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { UserModule } from "../models/studentprofile.model";
import DataModel, { QueryType } from "../helpers/DataModel";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../constants";
import * as config from "../config/index";
import { mongoose } from "@typegoose/typegoose";
import { triggerNotification } from "../library/notification";

export const passportAuth = (passport: PassportStatic) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: "/auth/google/redirect",
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        const newUser = {
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails && profile.emails[0] && profile.emails[0].value,
          thumbnail:
            profile.photos && profile.photos[0] && profile.photos[0].value,
          admin: false,
          redirectToAdmin: false,
          mentor: false,
        };

        try {
          const UserModelFind = new DataModel<UserModule>(
            DB_COLLECTIONS.USER_DETAILS_MODULE,
            DB_CONSTANTS.SEARCH_ACTION,
            DB_CONSTANTS.FIND_ONE,
            { email: profile && profile.emails && profile.emails[0].value }
          );
          let user = await UserModelFind.exec();

          if (user) {
            const params = {
              userEmail: user.email,
              notifications: [
                {
                  header: `Welcome back! ${user.username}`,
                },
              ],
            };
            triggerNotification(params);
            done(null, user);
          } else {
            const UserModelCreate = new DataModel<UserModule>(
              DB_COLLECTIONS.USER_DETAILS_MODULE,
              DB_CONSTANTS.CREATE_ACTION
            );

            UserModelCreate.setDocToUpdate(newUser);
            await UserModelCreate.exec().then((doc) => {
              return doc.save().then(async () => {
                const UserModelNewFind = new DataModel<UserModule>(
                  DB_COLLECTIONS.USER_DETAILS_MODULE,
                  DB_CONSTANTS.SEARCH_ACTION,
                  DB_CONSTANTS.FIND_ONE,
                  { email: newUser.email }
                );
                let newUserCreated = await UserModelNewFind.exec();
                done(null, newUserCreated);
              });
            });
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: any, done) => {
    const UserModelFind = new DataModel<UserModule>(
      DB_COLLECTIONS.USER_DETAILS_MODULE,
      DB_CONSTANTS.SEARCH_ACTION,
      DB_CONSTANTS.FIND_ONE,
      { _id: new mongoose.Types.ObjectId(id.toString()) }
    );
    UserModelFind.exec()
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  });
};
