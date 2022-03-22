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
  socket.on("enter_room", (msg, done) => {
    console.log(msg);
    setTimeout(() => {
      done();
    }, 10000);
  });
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
