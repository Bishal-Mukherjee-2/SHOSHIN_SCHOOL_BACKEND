import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

const LESSION_TYPE: string[] = ["MCQ", "CONTENT", "VIDEO", "EDITOR"];
const EDITOR_TYPE: string[] = ["PROGRAMMING", "REACTJS"];

class Description {
  @prop()
  text: string;

  @prop()
  glowText: number;
}

export class EditorPreferences {
  @prop()
  title: string;

  @prop()
  description: Array<Description>;

  @prop()
  testCases: number;

  @prop()
  codeSolutionS3Url: string;

  @prop()
  starterCodeS3Url: string;

  @prop()
  hintVideoUrlS3Url: string;

  @prop()
  testCaseFolderS3Url: string;
}

export class AdminLesson {
  readonly _id: mongoose.Schema.Types.ObjectId;

  @prop()
  courseId: string;

  @prop()
  moduleId: mongoose.Schema.Types.ObjectId;

  @prop()
  lessionName: string;

  @prop()
  moduleLevel: string;

  @prop({ type: String, enum: LESSION_TYPE })
  lessionType: string;

  @prop()
  disable: boolean;

  @prop()
  editorPreferences: EditorPreferences;

  @prop()
  mcqPreferences: {
    question: string;
    answer: Array<number>;
    options: Array<string>;
  };

  @prop()
  videoClassPreferences: {
    url: string;
  };

  @prop()
  doubts: Array<mongoose.Schema.Types.ObjectId>;

  @prop({
    default: Date.now,
  })
  createdAt: Date;
}
const AdminLessionModel = getModelForClass(AdminLesson);
export default AdminLessionModel;
