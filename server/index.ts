import { Server } from "socket.io";

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
});

io.on("disconnection", (socket) => {
  console.log("user disconnected", socket.id);
});
