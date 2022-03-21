import express from "express";
import http from "node:http";
import path from "path";
import { WebSocketServer } from "ws";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);
// app.listen(PORT, handleListen);
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

server.listen(PORT, handleListen);
