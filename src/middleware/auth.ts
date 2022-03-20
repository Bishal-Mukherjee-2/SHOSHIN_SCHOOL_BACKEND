import * as config from "../config";
import mongoose from "mongoose";
import { AuthenticationError } from "../errors";
import asyncWrapper from "../utilities/async-wrapper";
import { UserModule } from "../models/studentprofile.model";
import DataModel, { QueryType } from "../helpers/DataModel";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../constants";

export const protectedRoute = asyncWrapper(async (req: any, res, next) => {
  console.log("req res", req, "-------", res);

  const userId =
    req && req.session && req.session.passport && req.session.passport.user;

  if (userId) {
    const UserModelFind = new DataModel<UserModule>(
      DB_COLLECTIONS.USER_DETAILS_MODULE,
      DB_CONSTANTS.SEARCH_ACTION,
      DB_CONSTANTS.FIND_ONE,
      { _id: new mongoose.Types.ObjectId(userId) }
    );

    const user = await UserModelFind.exec();

    if (!user) {
      throw new AuthenticationError();
    }
  }

  next();
});
