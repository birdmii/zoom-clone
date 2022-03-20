import path from "path";
import express from "express";

const app = express();
const PORT = 3000;
const __dirname = path.resolve();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));

const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);
app.listen(PORT, handleListen);
