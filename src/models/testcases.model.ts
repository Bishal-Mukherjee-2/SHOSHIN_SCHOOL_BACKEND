import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

export class TestCaseContent {
  @prop()
  cpuTimeLimit: string;

  @prop()
  memoryLimit: string;

  @prop()
  stackLimit: string;

  @prop()
  expectedOutput: string;

  @prop()
  timeAllotted: string;
}

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class testcasesdetails {
  _id: mongoose.Schema.Types.ObjectId;

  @prop()
  moduleId: string;

  @prop()
  lessonId: string;

  @prop()
  courseId: string;

  @prop()
  languageId: string;

  @prop()
  testCases: {
    [key: string]: Array<TestCaseContent>;
  };
}

export type TestCases = {
  [P in keyof testcasesdetails]?:
    | testcasesdetails[P]
    | { [index: string]: any };
};

export type Module_strict = testcasesdetails;

const TestCasesModel = getModelForClass(testcasesdetails, {
  schemaOptions: { collection: "testcasesdetails" },
});

export default TestCasesModel;
