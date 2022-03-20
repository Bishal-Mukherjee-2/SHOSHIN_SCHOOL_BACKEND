import {
  getModelForClass,
  prop,
  modelOptions,
  Severity,
} from "@typegoose/typegoose"; //drone.io

const STATUS_TYPE: string[] = ["READ", "UNREAD"];

export class NotificationContent {
  @prop()
  header: string;

  @prop()
  body: string;

  @prop({ default: Date.now() })
  timeOfReceiving: string;

  @prop()
  link: string;

  @prop()
  imageLink: string;

  @prop({ type: String, enum: STATUS_TYPE, default: STATUS_TYPE[0] })
  status: string;
}

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class notificationsdetails {
  @prop()
  userEmail: string;

  @prop()
  notifications: Array<NotificationContent>;
}

export type Notification = {
  [P in keyof notificationsdetails]?:
    | notificationsdetails[P]
    | { [index: string]: any };
};

export type Module_strict = notificationsdetails;

const NotificationModel = getModelForClass(notificationsdetails, {
  schemaOptions: { collection: "notificationsdetails" },
});

export default NotificationModel;
