import axios from "axios";
import QueueLib from "../library/queue";
import DataModel from "../helpers/DataModel";
import { CodeExecution } from "../models/codeExecution.model";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../constants/index";
import { mongoose } from "@typegoose/typegoose";

const codeExec = {
  exec: function (_ch: any, payload: any, producerChannel: any) {
    /**
     *
     *               WORKING OF CODE EXECUTION ENGINE AT CONSUMER SIDE
     *
     * 1. First check if doc exists with _id, if there is compilation error or status= COMPLETED
     * then no need to process other messages
     *
     * 2. If Special message i.e [type=MARKING_COMPLETED] comes then it will check if all the test cases work has been done
     * --if done then update doc with status=COMPLETD
     * --else re-queue itsef
     *
     * 3. Condition if the execution doc exists
     *   Request for the data using token from Judge0,
     *  (a) If response is 'Processing' or 'In Queue' then requeue itself
     *  (b) If response is Compilation Error, then update doc with compilation error and testCases=[]
     *  (c) Else update the particular test case with result
     *
     * 4. If some error comes and its catched by catch block,
     * then update the error in doc with status='ERROR', to avoid test cases processing
     *
     */

    const CodeExecutionModel = new DataModel<CodeExecution>(
      DB_COLLECTIONS.CODE_EXECUTION_MODEL,
      DB_CONSTANTS.SEARCH_ACTION,
      DB_CONSTANTS.FIND_ONE,
      { _id: new mongoose.Types.ObjectId(payload.data.docId) }
    );
    return CodeExecutionModel.exec()
      .then((resDoc) => {
        if (
          resDoc &&
          (resDoc.compilationError ||
            resDoc.status === "COMPLETED" ||
            resDoc.status === "ERROR")
        ) {
          return Promise.resolve();
        } else if (resDoc && payload.data.type === "MARKING_COMPLETED") {
          if (
            resDoc &&
            resDoc.testCases.length === payload.data.totalTestCases
          ) {
            const CodeExecutionModelUpdate = new DataModel<CodeExecution>(
              DB_COLLECTIONS.CODE_EXECUTION_MODEL,
              DB_CONSTANTS.UPDATE_ACTION,
              DB_CONSTANTS.FIND_ONE_UPDATE,
              { _id: new mongoose.Types.ObjectId(payload.data.docId) }
            );
            CodeExecutionModelUpdate.setDocToUpdate({
              $set: { status: "COMPLETED" },
            });
            return CodeExecutionModelUpdate.exec();
          } else {
            console.log(
              `[code_execution][success][${payload.data.userEmail}] Re-queueing MARK COMPLETED message..`
            );
            return QueueLib.publishToexchange(
              producerChannel,
              "shoshin_automation",
              payload,
              "codeExecution",
              500
            );
          }
        } else if (resDoc && payload.data.token) {
          const url = `http://3.86.116.46/submissions/${payload.data.token}`;
          const getRequest = axios.get(url, {
            params: {
              base64_encoded: true,
            },
          });

          return getRequest.then((response: any) => {
            if (
              response &&
              response.data.status &&
              (response.data.status.description === "Processing" ||
                response.data.status.description === "In Queue")
            ) {
              console.log(
                `[code_execution][success][${payload.data.userEmail}] Re-queueing message code execution polling..`
              );
              return QueueLib.publishToexchange(
                producerChannel,
                "shoshin_automation",
                payload,
                "codeExecution",
                1000
              );
            } else {
              if (
                response.data &&
                response.data.status.description === "Compilation Error"
              ) {
                const CodeExecutionModelUpdate = new DataModel<CodeExecution>(
                  DB_COLLECTIONS.CODE_EXECUTION_MODEL,
                  DB_CONSTANTS.UPDATE_ACTION,
                  DB_CONSTANTS.FIND_ONE_UPDATE,
                  { _id: new mongoose.Types.ObjectId(payload.data.docId) }
                );
                CodeExecutionModelUpdate.setDocToUpdate({
                  $set: {
                    status: "COMPLETED",
                    testCases: [],
                    compilationError: response.data.compile_output,
                  },
                });
                return CodeExecutionModelUpdate.exec();
              } else {
                const CodeExecutionModelFind = new DataModel<CodeExecution>(
                  DB_COLLECTIONS.CODE_EXECUTION_MODEL,
                  DB_CONSTANTS.SEARCH_ACTION,
                  DB_CONSTANTS.FIND_ONE,
                  { _id: new mongoose.Types.ObjectId(payload.data.docId) }
                );

                return CodeExecutionModelFind.exec().then((foundDoc) => {
                  const newObj: any = new Object();
                  newObj.testCaseId = payload.data.testCaseId;
                  newObj.result = response.data.status.description;

                  const CodeExecutionModelUpdate = new DataModel<CodeExecution>(
                    DB_COLLECTIONS.CODE_EXECUTION_MODEL,
                    DB_CONSTANTS.UPDATE_ACTION,
                    DB_CONSTANTS.FIND_ONE_UPDATE,
                    { _id: new mongoose.Types.ObjectId(payload.data.docId) }
                  );
                  CodeExecutionModelUpdate.setDocToUpdate({
                    $push: { testCases: newObj },
                  });
                  return CodeExecutionModelUpdate.exec();
                });
              }
            }
          });
        } else {
          return Promise.resolve();
        }
      })
      .catch((err) => {
        console.log(err);
        const CodeExecutionModelUpdate = new DataModel<CodeExecution>(
          DB_COLLECTIONS.CODE_EXECUTION_MODEL,
          DB_CONSTANTS.UPDATE_ACTION,
          DB_CONSTANTS.FIND_ONE_UPDATE,
          { _id: new mongoose.Types.ObjectId(payload.data.docId) }
        );
        CodeExecutionModelUpdate.setDocToUpdate({
          $set: {
            status: "ERROR",
            error: err.message,
          },
        });
        return CodeExecutionModelUpdate.exec();
      });
  },
};

export default { codeExec };
