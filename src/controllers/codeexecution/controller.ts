import asyncWrapper from "../../utilities/async-wrapper";
import AWS from "../../library/aws";
import DataModel from "../../helpers/DataModel";
import { CodeExecution } from "../../models/codeExecution.model";
import { TestCases } from "../../models/testcases.model";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../../constants/index";
import EventEmitterHelper from "../../helpers/EventEmitter";
import Bluebird from "bluebird";
import axios from "axios";

/**
 *                 WORKING OF CODE EXECUTION ENGINE PRODUCER SIDE
 * 
 *  1. Save the user's code on S3
 *  2. Create a new doc in codeexecutiondetails with status="PROCESSING"
 *  3. Fetch all test cases for that lesson/code from testcasesdetails 
 *  4. Fetch all test cases input/output files from S3 for that particular lesson or code
 *  5. Create an array of promises for each test case with all the requires fields like studentCode,
       stdin,output,totalTestCases,cpuTimeLimit,memoryLimit,stackLimit,timeAllotted,testCaseId,
       languageId,userEmail,lessonId,moduleId,courseId,docId
 *  6. Hit post request to for each element of above array to Judge0 to get token, and create a payload 
	   to send in CODE_EXECUTION queue, to poll for each test case result
 *  7. Afte all, these request from consumer side, enque a special message which will check if all
	    the test cases are completed or not, and mark doc as completed
 */

/**
 *
 * @param userCode  User's code coming from post request
 * @param userEmail Requested user email
 * @param moduleId  ModuleId of the code being run
 * @param lessonId  LessonId of the code being run
 * @param courseId  CourseId of the code being run
 * @param languageId  eg languageId of C language is 48
 */

export const studentCodeDetails = (
  userCode: string,
  userEmail: string,
  moduleId: string,
  lessonId: string,
  courseId: string,
  languageId: string
): Promise<any> => {
  let objQuery: any = new Object();
  objQuery = {
    userEmail,
    moduleId,
    lessonId,
    courseId,
    status: "PROCESSING",
  };
  const codeDetails = {
    userCode: JSON.stringify(userCode),
    userEmail,
    moduleId,
    lessonId,
    courseId,
    status: "PROCESSING",
    languageId,
  };
  const CodeExecutionModel = new DataModel<CodeExecution>(
    DB_COLLECTIONS.CODE_EXECUTION_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    objQuery
  );

  return CodeExecutionModel.exec().then((exists): Promise<any> => {
    if (!exists) {
      const CodeModel = new DataModel(
        DB_COLLECTIONS.CODE_EXECUTION_MODEL,
        DB_CONSTANTS.CREATE_ACTION
      );
      CodeModel.setDocToUpdate(codeDetails);
      return CodeModel.exec().then((doc) => {
        return doc.save().then(() => {
          return doc;
        });
      });
    } else {
      console.log("ALREADY_IN_PROGRESS");
      return Promise.resolve({ message: "ALREADY IN PROGRESS" });
    }
  });
};

export const uploadContentDataToS3 = (dataObjS3: any): Bluebird<any> => {
  let { userCode, userEmail, moduleId, lessonId, courseId } = dataObjS3;

  if (!userCode || !userEmail || !moduleId || !lessonId || !courseId) {
    return Bluebird.resolve({ message: "No files received" });
  } else {
    let dataObj: any = new Object();
    dataObj.Bucket = "student-code-bucket-ss";
    dataObj.Body = userCode;
    dataObj.Key = `${userEmail}/${courseId}/${moduleId + "_moduleId"}/${
      lessonId + "_lessonId"
    }/userCode.txt`;

    return AWS.putObject(dataObj, `userCode.txt`)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

export const getContentDataFromS3 = async (
  dataObjS3: any,
  testCaseId: number
) => {
  let { courseId, moduleId, lessonId } = dataObjS3;
  let objData: any = {};
  objData.bucketName = "student-code-bucket-ss";
  const input = await AWS.promisifyGetAWSFileReadStream(
    objData.bucketName,
    `admin/${courseId}/${moduleId + "_moduleId"}/${
      lessonId + "_lessonId"
    }/testcase${testCaseId}.txt`
  );
  const output = await AWS.promisifyGetAWSFileReadStream(
    objData.bucketName,
    `admin/${courseId}/${moduleId + "_moduleId"}/${
      lessonId + "_lessonId"
    }/output${testCaseId}.txt`
  );

  const resultObj: any = new Object();
  resultObj.stdin = Buffer.from(input.Body).toString("utf8");
  resultObj.output = Buffer.from(output.Body).toString("utf8");

  return resultObj;
};

export const codeCompilationJudge0 = (
  userCode: string,
  stdin: string,
  output: string,
  totalTestCases: number,
  cpuTimeLimit: string,
  memoryLimit: string,
  stackLimit: string,
  timeAllotted: string,
  testCaseId: number,
  languageId: string,
  userEmail: string,
  lessonId: string,
  moduleId: string,
  courseId: string,
  docId: string
) => {
  const response = axios({
    method: "POST",
    url: "http://3.86.116.46/submissions",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    data: JSON.stringify({
      language_id: languageId,
      source_code: userCode,
      cpu_time_limit: cpuTimeLimit,
      expected_output: output,
      memory_limit: memoryLimit,
      stack_limit: stackLimit,
      stdin: stdin,
      wall_time_limit: timeAllotted,
    }),
  });

  return response
    .then((res: any) => {
      const payload: any = new Object();
      payload.userEmail = userEmail;
      payload.totalTestCases = totalTestCases;
      payload.testCaseId = testCaseId;
      payload.lessonId = lessonId;
      payload.moduleId = moduleId;
      payload.courseId = courseId;
      payload.token = res.data.token;
      payload.docId = docId;

      const queuePayload = {
        data: payload,
        user: userEmail,
        q_name: "CODE_EXECUTION",
        process_type: "PARENT",
        dontWait: true,
        action: "codeExec",
      };

      EventEmitterHelper.emitEvent("enqueue", queuePayload);
      return Promise.resolve(true);
    })
    .catch((err: any) => {
      console.log(err);
    });
};

export const codeExecution = asyncWrapper((req, res): Bluebird<any> => {
  const { userCode, userEmail, lessonId, moduleId, courseId, languageId } =
    req.body;

  return uploadContentDataToS3(req.body)
    .then((resp) => {
      return resp;
    })
    .then(() => {
      return studentCodeDetails(
        userCode,
        userEmail,
        moduleId,
        lessonId,
        courseId,
        languageId
      ).then((response): Promise<any> => {
        if (response.message === "ALREADY IN PROGRESS") {
          res.status(201).json({ message: "already in progress" });
          return Promise.resolve({});
        } else {
          return fetchTestCases(lessonId, moduleId, courseId, languageId).then(
            (testCasesResponse) => {
              //stdin input to be fetched from s3 admin
              let dataObj: any = { lessonId, moduleId, courseId };
              const getAllFiles = testCasesResponse.exists.testCases[
                languageId
              ].map((testCase: any, index: number) => {
                return getContentDataFromS3(dataObj, index + 1);
              });

              return Bluebird.all(getAllFiles).then((allFiles) => {
                const prmExecutions = allFiles.map(
                  (file: any, index: number) => {
                    let execObj: any = new Object();
                    execObj.stdin = file.stdin;
                    execObj.output = file.output;
                    execObj.testCaseId = index + 1;
                    execObj.totalTestCases =
                      testCasesResponse.exists.testCases[languageId].length;
                    execObj.cpuTimeLimit =
                      testCasesResponse.exists.testCases[languageId][
                        index
                      ].cpuTimeLimit;
                    execObj.memoryLimit =
                      testCasesResponse.exists.testCases[languageId][
                        index
                      ].memoryLimit;
                    execObj.stackLimit =
                      testCasesResponse.exists.testCases[languageId][
                        index
                      ].stackLimit;
                    execObj.timeAllotted =
                      testCasesResponse.exists.testCases[languageId][
                        index
                      ].timeAllotted;
                    execObj.studentCode = userCode;
                    execObj.docId = response._id;

                    return execObj;
                  }
                );

                const requestJudge0 = prmExecutions.map((exec) => {
                  return codeCompilationJudge0(
                    exec.studentCode,
                    exec.stdin,
                    exec.output,
                    exec.totalTestCases,
                    exec.cpuTimeLimit,
                    exec.memoryLimit,
                    exec.stackLimit,
                    exec.timeAllotted,
                    exec.testCaseId,
                    languageId,
                    userEmail,
                    lessonId,
                    moduleId,
                    courseId,
                    exec.docId.toString()
                  );
                });

                const payload: any = new Object();
                payload.userEmail = userEmail;
                payload.totalTestCases =
                  testCasesResponse.exists.testCases[languageId].length;
                payload.lessonId = lessonId;
                payload.moduleId = moduleId;
                payload.courseId = courseId;
                payload.docId = response._id;
                payload.type = "MARKING_COMPLETED";

                const queuePayload = {
                  data: payload,
                  user: userEmail,
                  q_name: "CODE_EXECUTION",
                  process_type: "PARENT",
                  dontWait: true,
                  action: "codeExec",
                };

                return Promise.all(requestJudge0).then(() => {
                  //Enqueuing a special message which will check if all the test cases are completed or not, and mark doc as completed
                  EventEmitterHelper.emitEvent("enqueue", queuePayload);
                  res.status(201).json({ message: "Code Execution Started!" });
                  return Promise.resolve();
                });
              });
            }
          );
        }
      });
    })
    .catch((err) => {
      let objQuery: any = new Object();
      objQuery = {
        userEmail,
        moduleId,
        lessonId,
        courseId,
      };

      const CodeExecutionModel = new DataModel<CodeExecution>(
        DB_COLLECTIONS.CODE_EXECUTION_MODEL,
        DB_CONSTANTS.UPDATE_ACTION,
        DB_CONSTANTS.FIND_ONE_UPDATE,
        objQuery
      );
      CodeExecutionModel.setDocToUpdate({
        $set: { status: "FAILED", error: err.message },
      });
      return CodeExecutionModel.exec();
    });
});

export const setupTestCases = asyncWrapper((req, res) => {
  const { moduleId, lessonId, courseId, languageId, testCases } = req.body;

  let objQuery: any = new Object();
  objQuery = {
    moduleId,
    lessonId,
    courseId,
    languageId,
  };

  let testCasesObject: any = new Object();
  testCasesObject = {
    moduleId,
    lessonId,
    courseId,
    languageId,
    testCases,
  };
  const TestCasesModel = new DataModel<TestCases>(
    DB_COLLECTIONS.TEST_CASES_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    objQuery
  );

  return TestCasesModel.exec().then((exists): Promise<any> => {
    if (!exists) {
      const TCasesModel = new DataModel(
        DB_COLLECTIONS.TEST_CASES_MODEL,
        DB_CONSTANTS.CREATE_ACTION
      );
      TCasesModel.setDocToUpdate(testCasesObject);
      return TCasesModel.exec().then((doc) => {
        doc.save().then(() => {
          return res.status(201).json({ message: "OBJECT ADDED" });
        });
      });
    } else {
      res.status(409).json({ message: "ALREADY EXISTS" });
      return Promise.resolve({});
    }
  });
});

export const fetchTestCases = (
  lessonId: string,
  moduleId: string,
  courseId: string,
  languageId: string
) => {
  let objQuery: any = new Object();
  objQuery = {
    moduleId,
    lessonId,
    courseId,
    languageId,
  };
  const TestCasesModel = new DataModel<TestCases>(
    DB_COLLECTIONS.TEST_CASES_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    objQuery
  );
  return TestCasesModel.exec().then((exists): Promise<any> => {
    if (!exists) {
      return Promise.resolve({ message: "OBJECT_NOT_FOUND" });
    } else {
      return Promise.resolve({ exists });
    }
  });
};
