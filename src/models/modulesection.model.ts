import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

export class Section {
  @prop()
  sectionId: number;

  @prop()
  name: string;
}

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class modulesectiondetails {
  _id: mongoose.Schema.Types.ObjectId;

  @prop()
  courseId: string;

  @prop()
  sections: Array<Section>;

  @prop({ default: Date.now })
  createdDate: Date;

  @prop({ default: Date.now })
  lastUpdatedDate: Date;

  @prop({ default: 1 })
  flgUseStatus: number;

  @prop()
  hardDeleteTime: Date;
}

export type ModuleSection = {
  [P in keyof modulesectiondetails]?:
    | modulesectiondetails[P]
    | { [index: string]: any };
};

export type ModuleSection_strict = modulesectiondetails;

const ModuleSectionModel = getModelForClass(modulesectiondetails, {
  schemaOptions: { collection: "modulesectiondetails" },
});
export default ModuleSectionModel;
