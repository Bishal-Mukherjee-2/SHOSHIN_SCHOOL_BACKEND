import asyncWrapper from "../../utilities/async-wrapper";
import DataModel from "../../helpers/DataModel";
import { DB_COLLECTIONS, DB_CONSTANTS } from "../../constants/index";
import { Notification } from "../../models/notifications.model";

export const fetchNotifications = asyncWrapper((req, res) => {
  const { userEmail } = req.body;

  let findNotificationObjQuery: any = new Object();
  findNotificationObjQuery = {
    userEmail,
  };

  const NotificationModelFind = new DataModel<Notification>(
    DB_COLLECTIONS.NOTIFICATION_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    findNotificationObjQuery
  );

  return NotificationModelFind.exec().then((notification): Promise<any> => {
    if (!notification) {
      res.status(404).json({ message: "NO_NOTIFICATIONS" });
    } else {
      let { notifications } = notification;
      notifications.sort(function (a: any, b: any) {
        let prevDate: any = new Date(b.timeOfReceiving);
        let nextDate: any = new Date(a.timeOfReceiving);
        return prevDate - nextDate;
      });
      res.status(200).json({ notifications });
    }
    return Promise.resolve({});
  });
});

export const readAllNotifications = asyncWrapper((req, res) => {
  const { userEmail } = req.body;

  let findNotificationObjQuery: any = new Object();
  findNotificationObjQuery = {
    userEmail,
  };

  const NotificationModelFind = new DataModel<Notification>(
    DB_COLLECTIONS.NOTIFICATION_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    findNotificationObjQuery
  );

  return NotificationModelFind.exec().then((notificationObj): Promise<any> => {
    if (!notificationObj) {
      res.status(201).json({ message: "NO_NOTIFICATIONS" });
    } else {
      const NotificationModelUpdate = new DataModel<Notification>(
        DB_COLLECTIONS.NOTIFICATION_MODEL,
        DB_CONSTANTS.UPDATE_ACTION,
        DB_CONSTANTS.FIND_ONE_UPDATE,
        findNotificationObjQuery
      );
      let { notifications } = notificationObj;
      let updatedNotifications = notifications.map((n: any) => {
        n.status = "READ";
        return n;
      });
      NotificationModelUpdate.setDocToUpdate({
        $set: { notifications: updatedNotifications },
      });
      return NotificationModelUpdate.exec().then(() => {
        res.status(200).json({ message: "MARKED_ALL_READ" });
      });
    }
    return Promise.resolve({});
  });
});

export const deleteAllNotifications = asyncWrapper((req, res) => {
  const { userEmail } = req.body;

  let findNotificationObjQuery: any = new Object();
  findNotificationObjQuery = {
    userEmail,
  };

  const NotificationModelFind = new DataModel<Notification>(
    DB_COLLECTIONS.NOTIFICATION_MODEL,
    DB_CONSTANTS.SEARCH_ACTION,
    DB_CONSTANTS.FIND_ONE,
    findNotificationObjQuery
  );

  return NotificationModelFind.exec().then((notificationObj): Promise<any> => {
    if (!notificationObj) {
      res.status(201).json({ message: "NO_NOTIFICATIONS" });
    } else {
      const NotificationModelUpdate = new DataModel<Notification>(
        DB_COLLECTIONS.NOTIFICATION_MODEL,
        DB_CONSTANTS.UPDATE_ACTION,
        DB_CONSTANTS.FIND_ONE_UPDATE,
        findNotificationObjQuery
      );
      let emptyNotificationsArray: any = [];
      NotificationModelUpdate.setDocToUpdate({
        $set: { notifications: emptyNotificationsArray },
      });
      return NotificationModelUpdate.exec().then(() => {
        res.status(200).json({ message: "NOTIFICATIONS_DELETED" });
      });
    }
    return Promise.resolve({});
  });
});
