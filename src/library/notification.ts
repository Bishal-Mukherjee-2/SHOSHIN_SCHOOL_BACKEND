import { Log } from "../utilities/debug";
import { ioInstance } from "../socket-io/socketio";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../constants/index";
import DataModel from "../helpers/DataModel";
import { Notification } from "../models/notifications.model";

const notificationHelper = (params: any) => {
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
};

export const triggerNotification = (params: any) => {
  params.notifications = params.notifications.map((p: any) => {
    p.timeOfReceiving = new Date();
    return p;
  });
  return notificationHelper(params).then(() => {
    ioInstance.emit("notify", params);
    return Promise.resolve({});
  });
};

// {
//     "userEmail": "bishalmukherjee448@gmail.com",
//     "notifications": [
//         {
//             "header": "header of N40",
//             "body": "body of N40",
//             "link": "link of N40",
//             "imageLink": "imageLink of N40"
//         }
//     ]
// }
