import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import { mongoose } from "@typegoose/typegoose";

// const TYPE_OF_MESSAGE: string[] = ["TEXT", "IMAGE"];

export class MentorContent {
  @prop()
  email: string;

  @prop()
  profileImage: string;

  @prop({ default: false })
  escalated: boolean;

  @prop({ default: Date.now() })
  timeStamp: Date;
}

export class ChatContent {
  //   @prop({ enum: TYPE_OF_MESSAGE })
  type: string;

  @prop()
  value: string;

  @prop()
  sender: string;

  @prop({ default: Date.now() })
  timeStamp: Date;
}

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class doubtdetails {
  _id: mongoose.Schema.Types.ObjectId;

  @prop()
  profileImageStudent: string;

  @prop()
  courseId: string;

  @prop()
  moduleId: mongoose.Schema.Types.ObjectId;

  @prop()
  lessonId: mongoose.Schema.Types.ObjectId;

  @prop()
  title: string;

  @prop()
  description: string;

  @prop()
  studentEmail: string;

  @prop()
  currentMentor: string;

  @prop()
  currentMentorProfileImage: string;

  @prop({ default: "active" })
  state: string;

  @prop()
  lastMessage: string;

  @prop()
  roomId: string;

  @prop()
  mentor: Array<MentorContent>;

  @prop()
  chats: Array<ChatContent>;
}

export type Doubt = {
  [P in keyof doubtdetails]?: doubtdetails[P] | { [index: string]: any };
};

export type Doubt_strict = doubtdetails;

const DoubtModel = getModelForClass(doubtdetails, {
  schemaOptions: { collection: "doubtdetails" },
});

export default DoubtModel;
