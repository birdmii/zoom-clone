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

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

let clients = {};
let socketIds = {};
const MAX = 2;

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    if(clients[roomName]) {
      const length = clients[roomName].length;
      if(length === MAX) {
        socket.emit("room_full");
        return;
      } 
      clients[roomName].push({id: socket.id});
    } else {
      clients[roomName] = [{id: socket.id}];
    }
    socket.emit("join");
    socketIds[socket.id] = roomName;

    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });

  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });

  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });

  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });

  socket.on("disconnect", () => {
    const roomId = socketIds[socket.id];
    let room = clients[roomId];
    if(room) {
      room = room.filter(client => client.id !== socket.id);
      clients[roomId] = room;
    }
  })
});

const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);
httpServer.listen(PORT, handleListen);
