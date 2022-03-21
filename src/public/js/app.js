const socket = new WebSocket(`ws://${window.location.host}`);
socket.addEventListener("open", () => {
  console.log("Connected to Server 👍");
});

socket.addEventListener("message", (msg) => {
  console.log("New message:", msg.data);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server 🚨")
})

setTimeout(() => {
  socket.send("Hello from the browser!")
}, 3000);