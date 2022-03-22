const socket = io();

const welcome = document.querySelector("#welcome");
const room = document.getElementById("room");
const form = welcome.querySelector("form");

room.hidden = true;
let roomNm;

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `🍕 Chat Room Name ${roomNm}`;
}

function handleRoomSubmit(e) {
  e.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomNm = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
  addMessage("Someone joined!");
});
