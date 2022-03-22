const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nicknameForm = document.querySelector("#nickname");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = {type, payload};
  return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
  console.log("Connected to Server 👍");
});

socket.addEventListener("message", (msg) => {
  const li = document.createElement("li");
  li.innerText = msg.data
  messageList.append(li);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server 🚨")
})

function handleSubmit(e) {
  e.preventDefault();

  const input = messageForm.querySelector("input");
  socket.send(makeMessage("message", input.value));
  input.value = "";
}

function handleNicknameSubmit(e) {
  e.preventDefault();
  const input = nicknameForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit)
nicknameForm.addEventListener("submit", handleNicknameSubmit)