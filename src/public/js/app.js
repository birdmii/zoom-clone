const socket = io();

const welcomeArea = document.querySelector("#welcome");
const roomArea = document.getElementById("room");
const form = welcomeArea.querySelector("form");
const nicknameArea = document.querySelector("#nickname");
const nicknameForm = nicknameArea.querySelector("form");

roomArea.hidden = true;
nicknameArea.hidden = true;
let roomNm;
let nickname;

function addMessage(msg) {
  const ul = roomArea.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

function handleMessageSubmit(e) {
  e.preventDefault();
  const input = roomArea.querySelector("#msg input");
  const msg = input.value;
  socket.emit("new_message", msg, roomNm, () => {
    addMessage(`Me: ${msg}`);
  });

  input.value = "";
}

function showRoom() {
  welcomeArea.hidden = true;
  roomArea.hidden = false;
  nicknameArea.querySelector("form").querySelector("input").defaultValue =
    nickname;
  nicknameArea.hidden = false;

  const h3 = roomArea.querySelector("h3");
  h3.innerText = `🍕 Chat room ${roomNm}`;
  const msgForm = roomArea.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function showRoomInfo(newCount) {
  const h3 = roomArea.querySelector("h3");
  h3.innerText = `🍕 Chat room ${roomNm} (${newCount})`;
}

function handleRoomSubmit(e) {
  e.preventDefault();
  const inputRoomname = form.getElementsByTagName("input")[0];
  const inputNickname = form.getElementsByTagName("input")[1];
  socket.emit("enter_room", inputRoomname.value, inputNickname.value, showRoom);
  roomNm = inputRoomname.value;
  nickname = inputNickname.value;

  inputRoomname.value = "";
}

function handleNicknameSubmit(e) {
  e.preventDefault();
  const changeNickname = nicknameForm.querySelector("input");
  socket.emit("nickname_change", changeNickname.value);
}

form.addEventListener("submit", handleRoomSubmit);

nicknameForm.addEventListener("submit", handleNicknameSubmit);

socket.on("welcome", (nickname, newCount) => {
  showRoomInfo(newCount);
  addMessage(`📢 ${nickname} has joined 💫`);
});

socket.on("bye", (nickname, newCount) => {
  showRoomInfo(newCount);
  addMessage(`📢 ${nickname} has left 🚪`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcomeArea.querySelector("ul");
  roomList.innerHTML = "";

  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});

socket.on("nickname_change", (originalNickname, nickname) => {
  addMessage(`📢 ${originalNickname} ➡️ ${nickname}: nickname changed 🔁`)
})
