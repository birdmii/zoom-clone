import express from "express";
import { Server } from "socket.io";
import http from "node:http";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);
// app.listen(PORT, handleListen);
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on("connection", (socket) => {
  socket.onAny((event) => console.log(`Socket Event: ${event}`));
  socket.on("enter_room", (roomNm, nickname, done) => {
    socket.join(roomNm);
    socket["nickname"] = nickname;
    done();
    socket.to(roomNm).emit("welcome", socket.nickname);
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname));
  });

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// const wss = new WebSocketServer({ server });
// const sockets = [];

// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anonymous"
//   console.log("Connected to the Browser ✅");
//   socket.on("close", () => "Disconnected from Server");
//   socket.on("message", (msg) => {
//     const parsedMsg = JSON.parse(msg);
//     switch (parsedMsg.type) {
//       case "message":
//         sockets.forEach((eachSocket) => eachSocket.send(`${socket.nickname}: ${parsedMsg.payload}`));
//         break;
//       case "nickname":
//         socket["nickname"] = parsedMsg.payload;
//         break;
//     }
//   });
// });

httpServer.listen(PORT, handleListen);
