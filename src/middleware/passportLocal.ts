import * as PassportLocal from "passport-local";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../constants";
import DataModel from "../helpers/DataModel";
import { UserModule } from "src/models/studentprofile.model";
import { AuthenticationError } from "../errors";
import { PassportStatic } from "passport";

export const passportLocalAuth = (passport: PassportStatic) => {
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
  passport.use(
    new PassportLocal.Strategy(
      {
        usernameField: "email",
      },
      async (email: any, password: any, done: any) => {
        try {
          let objectQuery = {
            email,
          };
          const UserModelFind = new DataModel<UserModule>(
            DB_COLLECTIONS.USER_DETAILS_MODULE,
            DB_CONSTANTS.SEARCH_ACTION,
            DB_CONSTANTS.FIND_ONE,
            objectQuery
          );

          const user = await UserModelFind.exec();

          if (user.password !== password) {
            done(null, false);
            throw new AuthenticationError();
          } else {
            done(null, user);
          }

          if (!user) {
            done(null, false);
            throw new AuthenticationError();
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );
};
