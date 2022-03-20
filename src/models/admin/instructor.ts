import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

const GENDER: string[] = ["Male", "Female", "Others"];

export class AdminInstructor {
  readonly _id: mongoose.Schema.Types.ObjectId;

  @prop()
  name: string;

  @prop({
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  })
  email: string;

  @prop()
  dateOfBirth: Date;

  @prop({ type: String, enum: GENDER })
  gender: string;

  @prop()
  designation: string;

  @prop()
  description: string;

  @prop()
  profileImage: string;

  @prop({
    type: Number,
    default: 0,
  })
  enrollStudents: number;

  @prop({
    type: Number,
    default: 0,
  })
  coursesCreated: number;

  @prop({
    type: Number,
    default: 0,
  })
  ratings: number;

  @prop({
    type: Number,
    default: 0,
  })
  reviews: number;

  @prop({
    type: Boolean,
    default: false,
  })
  disable: boolean;
}

const AdminInstructorModel = getModelForClass(AdminInstructor);
export default AdminInstructorModel;
