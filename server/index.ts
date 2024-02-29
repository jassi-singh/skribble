import { Server } from "socket.io";

interface TDrawInfo {
  id: string;
  x: number;
  y: number;
  lineWidth: number;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  eraseMode: boolean;
}

const io = new Server(5000, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

io.on("connection", (socket) => {
  console.log("user conncected", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  socket.on("start", (drawInfo: TDrawInfo) => {
    socket.broadcast.emit("recieve-start", drawInfo);
  });

  socket.on("drawing", (drawInfo: TDrawInfo) => {
    socket.broadcast.emit("recieve-drawing", drawInfo);
  });

  socket.on("stop", () => {
    socket.broadcast.emit("recieve-stop");
  });

  socket.on("reset-canvas", () => {
    socket.broadcast.emit("recieve-reset-canvas");
  });
});

io.on("disconnection", (socket) => {
  console.log("user disconnected", socket.id);
});
