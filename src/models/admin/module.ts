import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

class Lession {
  @prop()
  id: mongoose.Schema.Types.ObjectId;

  @prop()
  lessionName: string;

  @prop()
  disable: boolean;
}

class Module {
  @prop()
  readonly _id: mongoose.Schema.Types.ObjectId;

  @prop()
  name: string;

  @prop()
  icon: string;

  @prop()
  disable: boolean;

  @prop({
    default: [],
  })
  lessions: Array<Lession>;
}

export class AdminModule {
  readonly _id: mongoose.Schema.Types.ObjectId;

  @prop()
  courseId: string;

  @prop()
  level: number;

  @prop()
  level2Modules: mongoose.Types.Array<Module>;

  @prop()
  level3Modules: Array<Module>;

  @prop({
    default: Date.now,
  })
  createdAt: Date;
}

const AdminModuleModel = getModelForClass(AdminModule);
export default AdminModuleModel;
