import express from "express";
import http, { createServer } from "http";
import { Server } from "socket.io";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import formatMessage from "./utils/message.js";
import {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} from "./utils/user.js";

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 3000 || process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const botname = "Chatflow Bot";

io.on("connection", (socket) => {
  console.log("New WS Connection....");

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit("message", formatMessage(botname, "Welcome to Chatflow!"));

    // Brodcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botname, `${username} has joined the chat`)
      );

    // Send room and room users
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chat message
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(`${user.username}`, msg));
  });

  // Runs when clients disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    console.log(user);
    if (user)
      io.to(user.room).emit(
        "message",
        formatMessage(botname, `${user.username} has left the chat`)
      );

    // Send room and room users
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
});

server.listen(PORT, () => console.log("Listening at port " + PORT));
