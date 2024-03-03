import {
  SocketEvents,
  TDrawInfo,
  TMsg,
  TPlayer,
  TRoomInfo,
} from "@skribble/shared";
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
      round: rooms.get(roomId)?.round ?? 1,
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
        round: 1,
      });
      io.to(roomId).emit(
        SocketEvents.updatePlayers,
        rooms.get(roomId)?.players
      );
      cb(roomId);
    }
  );

  socket.on(SocketEvents.message, (msg: TMsg, roomId: string) => {
    msg.id = uuidv4();
    io.to(roomId).emit(SocketEvents.message, msg);
  });

  socket.on(
    SocketEvents.showWords,
    (
      roomId: string,
      cb: (words: string[], currentPlayerId: string) => void
    ) => {
      const words = ["fire", "water", "snake"];
      cb(words, socket.id);
      const player = rooms
        .get(roomId)
        ?.players.find((player) => player.id == socket.id);
      socket
        .to(roomId)
        .emit(SocketEvents.setInfoText, `${player?.name} is selecting a word`);
    }
  );

  socket.on(
    SocketEvents.selectWord,
    (word: string, roomId: string, playerId: string) => {
      rooms.set(roomId, {
        ...rooms.get(roomId)!,
        currentWord: word,
        currentPlayerId: playerId,
      });

      socket.to(roomId).emit(SocketEvents.selectWord, word.length, playerId);
      socket.to(roomId).emit(SocketEvents.setInfoText, null);
    }
  );
});
