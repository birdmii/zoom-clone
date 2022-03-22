const socket = io();

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(e) {
  e.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", { payload: input.value }, () => {
    console.log("CB funtion")
  });
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
