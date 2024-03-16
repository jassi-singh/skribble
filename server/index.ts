import {
  SocketEvents,
  TDrawInfo,
  TMsg,
  TPlayer,
  TRoomInfo,
} from "@skribble/shared";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from "dotenv";
dotenv.config();

const io = new Server(Number(process.env.PORT), {
  cors: {
    origin: [String(process.env.ORIGIN)],
  },
});

const rooms = new Map<string, TRoomInfo>();
const userToRoom = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("user conncected", socket.id);

  socket.on("disconnect", () => {
    console.log("user conncected", socket.id);

    const roomId = userToRoom.get(socket.id)!;
    const room = rooms.get(roomId);

    if (room) {
      rooms.set(roomId, {
        ...room,
        players: room.players.filter((p) => p.id != socket.id),
      });

      if (rooms.get(roomId)?.players.length == 0) {
        rooms.delete(roomId);
        clearInterval(room.timerId);
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
    const room = rooms.get(roomId);
    rooms.set(roomId, {
      ...room,
      round: room?.round ?? 1,
      players: [...(room?.players ?? []), player],
      currentDrawingInfo: room?.currentDrawingInfo ?? [],
      answeredBy: room?.answeredBy ?? new Set(),
      timeLeft: 180,
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
        answeredBy: new Set(),
        timeLeft: 180,
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
    const room = rooms.get(roomId);
    if (room?.currentWord === msg.message) {
      if (room.answeredBy.has(socket.id)) return;
      room.answeredBy.add(socket.id);
      room.players = room.players.map((player) =>
        player.id === socket.id
          ? {
              ...player,
              score:
                player.score +
                180 -
                Math.floor((180 - room.timeLeft) / 10) * 10,
            }
          : player.id === room.currentPlayerId
          ? { ...player, score: player.score + 30 }
          : player
      );
      rooms.set(roomId, { ...room });
      const guessedMsg = msg;
      guessedMsg.isCorrect = true;
      guessedMsg.message = "guessed it right";
      io.to(roomId).emit(SocketEvents.message, guessedMsg);
      io.to(roomId).emit(
        SocketEvents.updatePlayers,
        rooms.get(roomId)?.players
      );

      if (room.answeredBy.size === room.players.length - 1) {
        clearInterval(room.timerId);
        io.to(roomId).emit(
          SocketEvents.setInfoText,
          `The correct word is : ${room.currentWord}`
        );
        setTimeout(() => {
          startGame(roomId);
        }, 3000);
      }
    } else {
      io.to(roomId).emit(SocketEvents.message, msg);
    }
  });

  socket.on(SocketEvents.startGame, startGame);

  socket.on(
    SocketEvents.selectWord,
    (word: string, roomId: string, playerId: string) => {
      rooms.set(roomId, {
        ...rooms.get(roomId)!,
        currentWord: word,
        currentPlayerId: playerId,
      });

      startTimer(roomId, word);
      socket.to(roomId).emit(SocketEvents.selectWord, word.length, playerId);
      socket.to(roomId).emit(SocketEvents.setInfoText, null);
    }
  );
});

const startTimer = (roomId: string, word: string) => {
  const room = rooms.get(roomId);
  if (!room) return;
  room.timeLeft = 180;
  rooms.set(roomId, room);

  const timerId = setInterval(() => {
    let room = rooms.get(roomId)!;
    rooms.set(roomId, { ...room, timeLeft: (room.timeLeft -= 10) });
    const timeLeft = rooms.get(roomId)!.timeLeft;
    if (timeLeft === 0) {
      clearInterval(timerId);
      io.to(roomId).emit(
        SocketEvents.setInfoText,
        `The correct word is : ${word}`
      );
      setTimeout(() => {
        startGame(roomId);
      }, 3000);
    } else {
      io.to(roomId).emit(SocketEvents.syncTimer, timeLeft);
    }
  }, 10 * 1000);
  rooms.set(roomId, { ...room, timerId });
};

const startGame = (roomId: string) => {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.round === 4) {
    io.to(roomId).emit(SocketEvents.showResults, room.players);
    room.players.map((player) => {
      player.score = 0;
      return player;
    });
    room.round = 1;

    rooms.set(roomId, room);
    return;
  }

  const words = ["fire", "water", "snake"];
  io.to(roomId).emit(SocketEvents.setInfoText, null);
  io.to(roomId).emit(SocketEvents.resetCanvas);
  io.to(roomId).emit(SocketEvents.setRound, room?.round);

  rooms.set(roomId, { ...room, answeredBy: new Set() });

  const index =
    room.players.findIndex((player) => player.id === room.currentPlayerId) ??
    -1;

  const nextPlayer = room.players[(index + 1) % room.players.length];
  if (index + 2 === room.players.length) {
    const room = rooms.get(roomId)!;
    rooms.set(roomId, { ...room, round: room.round + 1 });
  }
  io.to(nextPlayer.id).emit(SocketEvents.showWords, words, nextPlayer.id);

  io.to(roomId)
    .except(nextPlayer.id)
    .emit(SocketEvents.setInfoText, `${nextPlayer?.name} is selecting a word`);
};
