import { Server, Socket } from "socket.io";
import SOCKET from "./actions";
const { ADD_MESSAGE, ADD_NOTIFICATION } = SOCKET;
export let ioInstance: Server;
const socket_connection = ({ io }: { io: Server }) => {
  io.on("connection", (socket: Socket) => {
    ioInstance = io;
    // console.log(socket.id);
    socket.on("joinRoom", (params) => {
      //   console.log(params.roomId);
      socket.join(params.roomId);
    });

    socket.on("message", (params) => {
      //   console.log(params);
      const { roomId } = params;
      ADD_MESSAGE(params).then(() => {
        io.to(roomId).emit("message", params);
      });
    });

    socket.on("notify", (params) => {
      params.notifications = params.notifications.map((p: any) => {
        p.timeOfReceiving = new Date();
        return p;
      });
      ADD_NOTIFICATION(params).then((res: any) => {
        io.emit("notify", params);
      });
    });

    // socket.on("disconnect", (params) => {
    //   console.log("disconnect");
    //   io.emit("dis", { message: "HI" });
    // });
  });
};

export default socket_connection;
