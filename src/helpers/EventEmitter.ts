import { EventEmitter } from "events";
import { Connection } from "amqplib";

const Emitter = new EventEmitter();

const registerEvent = (conn: Connection) => {
  Emitter.on("enqueue", (data) => {
    console.log("[EventEmitter] Message Received from publisher");
    const qName = data.q_name;
    const payload = data;
    return conn.createConfirmChannel().then(function (ch) {
      const strPayload = JSON.stringify(payload);
      ch.sendToQueue(qName, Buffer.from(strPayload));
      const await = ch.waitForConfirms();

      return await
        .then(function (ok) {
          ch.close();
          return data;
        })
        .catch(function (err) {
          ch.close();
          return Promise.reject(err);
        });
    });
  });
  console.log(`[EventEmitter] Registered`);
};

const emitEvent = (eventName: string, data: any) =>
  Emitter.emit(eventName, data);

export default { registerEvent, emitEvent };
