import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

const LEVEL: string[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export class CommonContent {
  @prop()
  title: string;

  @prop()
  description: string;
}

export class ProspectContent extends CommonContent {
  @prop()
  icon: string;
}

export class Reviews {
  @prop()
  studentName: string;

  @prop()
  comment: string;

  @prop()
  studentEmail: string;

  @prop()
  time: Date;
}
@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class coursedetails {
  _id: mongoose.Schema.Types.ObjectId;

  @prop()
  program: string;

  @prop()
  heading: string;

  @prop()
  bannerImage: string;

  @prop()
  subHeading: string;

  @prop()
  syllabusUrl: string;

  @prop()
  duration: string;

  @prop()
  enrollBy: Date;

  @prop()
  practiceQuestions: number;

  @prop()
  detailedDescription: string;

  @prop()
  videoUrl: string;

  @prop()
  prerequisite: string;

  @prop()
  courseContent: Array<CommonContent>;

  @prop()
  prospectTitle: string;

  @prop()
  prospectContent: Array<ProspectContent>;

  @prop()
  instructor: Array<mongoose.Schema.Types.ObjectId>;

  @prop()
  rating: number;

  @prop()
  reviews: Array<Reviews>;

  @prop()
  faqs: Array<CommonContent>;

  @prop({ type: String, enum: LEVEL })
  level: string;

  @prop()
  courseId: string;

  @prop()
  discountPercent: number;

  @prop()
  disable: boolean;

  @prop()
  blacklistedEmails: Array<string>;

  @prop()
  price: number;

  @prop({ default: Date.now })
  createdDate: Date;

  @prop({ default: Date.now })
  lastUpdatedDate: Date;

  @prop({ default: 1 })
  flgUseStatus: number;

  @prop()
  hardDeleteTime: Date;
}

export type Course = {
  [P in keyof coursedetails]?: coursedetails[P] | { [index: string]: any };
};

export type Course_strict = coursedetails;

const CourseModel = getModelForClass(coursedetails, {
  schemaOptions: { collection: "coursedetails" },
});
export default CourseModel;
