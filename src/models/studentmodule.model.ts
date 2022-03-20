import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

export class StudentData {
  @prop()
  studentScore: number;
}

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class studentmoduledetails {
  _id: mongoose.Schema.Types.ObjectId;

  @prop()
  emailId: string;

  @prop()
  courseId: string;

  @prop()
  modules: {
    [key: string]: StudentData;
  };

  @prop({ default: Date.now })
  createdDate: Date;

  @prop({ default: Date.now })
  lastUpdatedDate: Date;

  @prop({ default: 1 })
  flgUseStatus: number;

  @prop()
  hardDeleteTime: Date;
}

export type StudentModule = {
  [P in keyof studentmoduledetails]?:
    | studentmoduledetails[P]
    | { [index: string]: any };
};

export type StudentModule_strict = studentmoduledetails;

const StudentModuleModel = getModelForClass(studentmoduledetails, {
  schemaOptions: { collection: "studentmoduledetails" },
});
export default StudentModuleModel;
