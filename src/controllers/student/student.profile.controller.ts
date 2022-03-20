import asyncWrapper from "../../utilities/async-wrapper";
import { UserModule } from "../../models/studentprofile.model";
import {
  SS0006,
  SS0007,
  SS0008,
  SS0009,
  SS0010,
} from "../../errors/errorCodes";
import { Log } from "../../utilities/debug";
import mongoose from "mongoose";
import DataModel, { QueryType } from "../../helpers/DataModel";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../../constants";

// @desc      Get All Instructors
// @route     POST /api/admin/instructors
// @access    Private
export const toggleRedirectAdmin = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  const UserFindModel = new DataModel<UserModule>(
    DB_COLLECTIONS.USER_DETAILS_MODULE,
    DB_CONSTANTS.UPDATE_ACTION,
    DB_CONSTANTS.FIND_ONE_UPDATE,
    { email: email }
  );

  return UserFindModel.exec()
    .then((exist) => {
      if (exist) {
        const UserUpdateModel = new DataModel<UserModule>(
          DB_COLLECTIONS.USER_DETAILS_MODULE,
          DB_CONSTANTS.UPDATE_ACTION,
          DB_CONSTANTS.FIND_ONE_UPDATE,
          { email: email }
        );
        UserUpdateModel.setDocToUpdate({
          $set: { redirectToAdmin: !exist.redirectToAdmin },
        });

        return UserUpdateModel.exec().then((result) => {
          res.status(201).json({ message: "User Updated Successfully!" });
          return result;
        });
      } else {
        res.status(201).json({ message: "User doesn't exist" });
        return Promise.resolve();
      }
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0001] Something went wrong" });
      Log.error(error, `Error: ${SS0006}`);
    });
});

// @desc      Create a student profile
// @route     POST /api/admin/registerStudent
// @access    Public
export const registerStudent = asyncWrapper((req: any, res: any) => {
  const { email, password, username } = req.body;

  let newUser = { email, password, username };

  let objectQuery = {
    email,
  };

  const UserFindModel = new DataModel<UserModule>(
    DB_COLLECTIONS.USER_DETAILS_MODULE,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    objectQuery
  );

  return UserFindModel.exec().then((exist) => {
    if (exist) {
      return res.json(400).json({ message: "ALREADY REGISTERED" });
    } else {
      const UserModelCreate = new DataModel<UserModule>(
        DB_COLLECTIONS.USER_DETAILS_MODULE,
        DB_CONSTANTS.CREATE_ACTION
      );

      UserModelCreate.setDocToUpdate(newUser);
      return UserModelCreate.exec().then((doc) => {
        return doc.save().then(async () => {
          const UserModelNewFind = new DataModel<UserModule>(
            DB_COLLECTIONS.USER_DETAILS_MODULE,
            DB_CONSTANTS.SEARCH_ACTION,
            DB_CONSTANTS.FIND_ONE,
            { email: newUser.email }
          );
          UserModelNewFind.exec();
          return res.status(200).json({ message: "REGISTERED SUCCESSFULLY" });
        });
      });
    }
  });
});

export const studentLogin = asyncWrapper((req: any, res: any) => {
  return res.json({ message: "SUCCESSFULLY LOGGED IN" });
});
