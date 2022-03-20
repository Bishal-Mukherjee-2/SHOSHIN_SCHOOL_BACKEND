import { getModelForClass, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";

export class userdetails {
  readonly _id: mongoose.Schema.Types.ObjectId;

  @prop({
    required: [true, "Please add a name"],
    maxlength: 100,
  })
  username: string;

  @prop()
  password: string;

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
  googleId: string;

  @prop()
  thumbnail: string;

  @prop({
    default: false,
  })
  admin: boolean;

  @prop({
    default: false,
  })
  redirectToAdmin: boolean;

  @prop({
    default: false,
  })
  mentor: boolean;

  @prop({
    default: Date.now,
  })
  createdAt: Date;
}

export type UserModule = {
  [P in keyof userdetails]?: userdetails[P] | { [index: string]: any };
};

export type UserModule_strict = userdetails;

const UserModel = getModelForClass(userdetails, {
  schemaOptions: { collection: "userdetails" },
});
export default UserModel;
