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

function handleMessageSubmit(e) {
  e.preventDefault();
  const input = room.querySelector("#msg input");
  const msg = input.value;
  socket.emit("new_message", msg, roomNm, () => {
    addMessage(`Me: ${msg}`);
  });

  input.value = "";
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `🍕 This chat room ${roomNm}`;
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(e) {
  e.preventDefault();
  const inputRoomname = form.getElementsByTagName("input")[0];
  const inputNickname = form.getElementsByTagName("input")[1];
  socket.emit("enter_room", inputRoomname.value, inputNickname.value, showRoom);
  roomNm = inputRoomname.value;

  inputRoomname.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (nickname) => {
  addMessage(`📢 ${nickname} joined 💫`);
});

socket.on("bye", (nickname) => {
  addMessage(`📢 ${nickname} has left 🚪`);
});

socket.on("new_message", addMessage);
