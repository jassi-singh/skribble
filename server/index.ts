import { SocketEvents, TDrawInfo, TPlayer, TRoomInfo } from "@skribble/shared";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const io = new Server(5000, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

const rooms = new Map<string, TRoomInfo>();
const userToRoom = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("user conncected", socket.id);

  socket.on("disconnect", () => {
    const roomId = userToRoom.get(socket.id)!;
    const room = rooms.get(roomId);

    if (room) {
      rooms.set(roomId, {
        ...room,
        players: room.players.filter((p) => p.id != socket.id),
      });

      if (rooms.get(roomId)?.players.length == 0) {
        rooms.delete(roomId);
      }
      socket.broadcast
        .to(roomId)
        .emit(SocketEvents.updatePlayers, rooms.get(roomId)?.players);
    }
  });

  // CANVAS
  socket.on(SocketEvents.startDraw, (drawInfo: TDrawInfo, roomId: string) => {
    rooms.set(roomId, {
      ...rooms.get(roomId)!,
      currentDrawingInfo: [...rooms.get(roomId)!.currentDrawingInfo, drawInfo],
    });
    socket.broadcast.to(roomId).emit(SocketEvents.startDraw, drawInfo);
  });

  socket.on(SocketEvents.drawing, (drawInfo: TDrawInfo, roomId: string) => {
    rooms.set(roomId, {
      ...rooms.get(roomId)!,
      currentDrawingInfo: [...rooms.get(roomId)!.currentDrawingInfo, drawInfo],
    });
    socket.broadcast.to(roomId).emit(SocketEvents.drawing, drawInfo);
  });

  socket.on(SocketEvents.stopDraw, (roomId: string) => {
    rooms.set(roomId, {
      ...rooms.get(roomId)!,
      currentDrawingInfo: [...rooms.get(roomId)!.currentDrawingInfo, "stop"],
    });
    socket.broadcast.to(roomId).emit(SocketEvents.stopDraw);
  });

  socket.on(SocketEvents.resetCanvas, (roomId: string) => {
    rooms.set(roomId, {
      ...rooms.get(roomId)!,
      currentDrawingInfo: [],
    });
    socket.broadcast.to(roomId).emit(SocketEvents.resetCanvas);
  });

  socket.on(SocketEvents.userJoin, (player: TPlayer, roomId: string) => {
    socket.join(roomId);
    userToRoom.set(socket.id, roomId);
    rooms.set(roomId, {
      players: [...(rooms.get(roomId)?.players ?? []), player],
      currentDrawingInfo: rooms.get(roomId)?.currentDrawingInfo ?? [],
    });

    io.to(roomId).emit(SocketEvents.updatePlayers, rooms.get(roomId)?.players);

    socket.emit(
      SocketEvents.syncCanvas,
      rooms.get(roomId)?.currentDrawingInfo ?? []
    );
  });

  socket.on(
    SocketEvents.createRoom,
    (player: TPlayer, cb: (roomId: string) => void) => {
      const roomId = uuidv4();
      player.isAdmin = true;
      socket.join(roomId);
      userToRoom.set(socket.id, roomId);
      rooms.set(roomId, {
        players: [player],
        currentDrawingInfo: [],
      });
      io.to(roomId).emit(
        SocketEvents.updatePlayers,
        rooms.get(roomId)?.players
      );
      cb(roomId);
    }
  );
});

io.on("disconnection", (socket) => {
  console.log("user disconnected", socket.id);
});
