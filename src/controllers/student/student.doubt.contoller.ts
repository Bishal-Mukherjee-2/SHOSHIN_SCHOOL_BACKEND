import asyncWrapper from "../../utilities/async-wrapper";
import { Doubt } from "../../models/doubt.model";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../../constants/index";
import { mongoose } from "@typegoose/typegoose";
import DataModel from "../../helpers/DataModel";
import { Log } from "../../utilities/debug";
import { SS0001, SS0002, SS0003, SS0004, SS0005 } from "../../errors/errorCodes";

// @desc Raise Doubt
// @route POST

export const raiseDoubt = asyncWrapper((req, res) => {
  const { title, description, studentEmail, roomId } = req.body;

  const doubtQuery: any = new Object();
  doubtQuery.title = title;
  doubtQuery.description = description;
  doubtQuery.studentEmail = studentEmail;
  doubtQuery.roomId = roomId;

  const DoubtModelRaise = new DataModel<Doubt>(
    DB_COLLECTIONS.DOUBT_MODEL,
    DB_CONSTANTS.CREATE_ACTION
  );

  DoubtModelRaise.setDocToUpdate(doubtQuery);
  return DoubtModelRaise.exec()
    .then((doubt): Promise<any> => {
      return doubt.save().then((doubtCreated: any) => {
        res.status(201).json({
          message: "Doubt raised successfully",
        });
        return doubtCreated;
      });
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0001] Something went wrong" });
      Log.error(error, `Error: ${SS0001}`);
    });
});

// @desc get all the user's doubts
// @route GET

export const getDoubts = asyncWrapper((req, res) => {
  const { studentEmail } = req.params;

  const doubtQuery: any = new Object();
  //   doubtQuery.studentEmail = studentEmail;

  const DoubtModel = new DataModel<Doubt>(
    DB_COLLECTIONS.DOUBT_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND,
    doubtQuery
  );

  return DoubtModel.exec()
    .then((doubt): Promise<any> => {
      res.status(200).json(doubt);
      return Promise.resolve({});
    })
    .catch((error) => {
      res.status(400).json({ message: "[SS0002] Something went wrong" });
      Log.error(error, `Error: ${SS0002}`);
    });
});

// @desc attempt a doubt
// @router POST
// export const attemptSolvingDoubt = asyncWrapper((req, res) => {
//   const { mentorEmail } = req.body;
//   const doubtQuery: any = new Object();

//   doubtQuery.mentorEmail = mentorEmail;
// });
