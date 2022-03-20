import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

const LESSON_TYPE: string[] = ["MCQ", "CONTENT", "VIDEO", "EDITOR", "DND"];

export class Lesson {
  @prop()
  sequenceId: number;

  @prop()
  lessonName: string;

  @prop()
  lessonId: mongoose.Schema.Types.ObjectId;

  @prop({ type: String, enum: LESSON_TYPE })
  lessonType: string;
}
export class Module {
  @prop()
  sectionId: number;

  @prop()
  sectionName: string;

  @prop()
  name: string;

  @prop()
  iconImageUrl: string;

  @prop({ default: false })
  disable: boolean;

  @prop()
  sequenceId: number;

  @prop()
  lesson: Array<Lesson>;

  @prop()
  weightage: number;

  @prop()
  maxScore: number;
}

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class moduletemplatedetails {
  _id: mongoose.Schema.Types.ObjectId;

  @prop()
  courseId: string;

  @prop()
  modules: {
    [key: string]: Module;
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

export type ModuleTemplate = {
  [P in keyof moduletemplatedetails]?:
    | moduletemplatedetails[P]
    | { [index: string]: any };
};

export type ModuleTemplate_strict = moduletemplatedetails;

const ModuleTemplateModel = getModelForClass(moduletemplatedetails, {
  schemaOptions: { collection: "moduletemplatedetails" },
});
export default ModuleTemplateModel;
