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

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class moduledetails {
  _id: mongoose.Schema.Types.ObjectId;

  @prop()
  sectionId: number;

  @prop()
  sectionName: string;

  @prop()
  name: string;

  @prop()
  iconImageUrl: string;

  @prop()
  courseId: string;

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

  @prop({ default: Date.now })
  createdDate: Date;

  @prop({ default: Date.now })
  lastUpdatedDate: Date;

  @prop({ default: 1 })
  flgUseStatus: number;

  @prop()
  hardDeleteTime: Date;
}

export type Module = {
  [P in keyof moduledetails]?: moduledetails[P] | { [index: string]: any };
};

export type Module_strict = moduledetails;

const ModuleModel = getModelForClass(moduledetails, {
  schemaOptions: { collection: "moduledetails" },
});
export default ModuleModel;
