import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

const RESULT_TYPE: string[] = [
  "ACCEPTED",
  "FAILED",
  "TLE",
  "SEGMENTATION_FAULT",
  "COMPILATION_ERROR",
];

export class TestCaseContent {
  @prop()
  testCaseId: number;

  @prop({ type: String, enum: RESULT_TYPE })
  result: string;

  @prop()
  compilationError: string;

  @prop()
  timeTaken: string;

  @prop()
  memoryRequired: string;

  @prop()
  requestId: string;

  @prop({ default: "PROCESSING" })
  status: string;
}

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class codeexecutiondetails {
  _id: mongoose.Schema.Types.ObjectId;

  @prop()
  lessonId: string;

  @prop()
  moduleId: string;

  @prop()
  timeOfSubmission: string;

  @prop()
  userCode: string;

  @prop()
  userEmail: string;

  @prop()
  compilationError: string;

  @prop()
  testCases: Array<TestCaseContent>;

  @prop({ default: "PROCESSING" })
  status: string;

  @prop()
  error: string;

  @prop()
  languageId: string;

  @prop({ default: Date.now })
  createdDate: Date;

  @prop({ default: Date.now })
  lastUpdatedDate: Date;

  @prop({ default: 1 })
  flgUseStatus: number;

  @prop()
  hardDeleteTime: Date;
}

export type CodeExecution = {
  [P in keyof codeexecutiondetails]?:
    | codeexecutiondetails[P]
    | { [index: string]: any };
};

export type Module_strict = codeexecutiondetails;

const CodeExecutionModel = getModelForClass(codeexecutiondetails, {
  schemaOptions: { collection: "codeexecutiondetails" },
});

export default CodeExecutionModel;

// feat/code-execution
