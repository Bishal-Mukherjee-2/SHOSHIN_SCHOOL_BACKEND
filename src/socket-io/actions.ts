import { DB_COLLECTIONS, DB_CONSTANTS } from "../constants/index";
import { Log } from "../utilities/debug";
import DataModel from "../helpers/DataModel";
import { Doubt } from "../models/doubt.model";
import { Notification } from "../models/notifications.model";

const SOCKET = {
  ADD_MESSAGE(params: any) {
    const { type, value, sender, timeStamp } = params;

    const findDoubtQuery: any = new Object();
    findDoubtQuery.roomId = params.roomId;

    let chatQuery: any = new Object();

    chatQuery = {
      type,
      value,
      sender,
      timeStamp,
    };

    const DoubtModelFind = new DataModel<Doubt>(
      DB_COLLECTIONS.DOUBT_MODEL,
      DB_CONSTANTS.SEARCH_ACTION,
      DB_CONSTANTS.FIND_ONE,
      findDoubtQuery
    );

    return DoubtModelFind.exec().then((exist): Promise<any> => {
      if (!exist) {
        Log.error("ROOM DOESN'T EXIST");
      } else {
        exist.lastMessage = value;
        exist.chats.push(chatQuery);
        exist.save();
      }
      return Promise.resolve({});
    });
  },
  ADD_NOTIFICATION(params: any) {
    const { userEmail, notifications } = params;

    let findNotificationObjQuery: any = new Object();
    findNotificationObjQuery = {
      userEmail,
    };

    let date = new Date();
    let addedAttributesNotifications: any = [];

    notifications.map((n: any) => {
      addedAttributesNotifications.push({
        header: n.header,
        body: n.body,
        timeOfReceiving: date.getTime(),
        link: n.link,
        imageLink: n.imageLink,
        status: "UNREAD",
      });
    });

    let newNotification: any = {
      userEmail,
      notifications: addedAttributesNotifications,
    };

    const NotificationModelFind = new DataModel<Notification>(
      DB_COLLECTIONS.NOTIFICATION_MODEL,
      DB_CONSTANTS.SEARCH_ACTION,
      DB_CONSTANTS.FIND_ONE,
      findNotificationObjQuery
    );
    return NotificationModelFind.exec().then((exists): Promise<any> => {
      if (!exists) {
        const NotificationModelAdd = new DataModel<Notification>(
          DB_COLLECTIONS.NOTIFICATION_MODEL,
          DB_CONSTANTS.CREATE_ACTION
        );
        NotificationModelAdd.setDocToUpdate(newNotification);

        return NotificationModelAdd.exec()
          .then((notification): Promise<any> => {
            return notification.save().then(() => {
              return Promise.resolve({ message: "ADDED" });
            });
          })
          .catch((error) => {
            Log.error(error);
          });
      } else {
        addedAttributesNotifications.map((notification: object) => {
          exists.notifications.push(notification);
        });
        return exists.save().then(() => {
          return Promise.resolve({ message: "ADDED" });
        });
      }
    });
  },
};

export default SOCKET;
