const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");
const alertMsg = document.getElementById("alertMsg");

let myStream;
let isMuted = false;
let isCameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;
let isRoomFull = false;

call.style.setProperty("display", "none", "important");

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks();
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = `📷 ${camera.label}`;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.error(e);
  }
}

async function getMedia(deviceId) {
  const initConstraint = {
    audio: true,
    video: { facingMode: "user" },
  };

  const cameraConstraint = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraint : initConstraint
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.error(e);
  }
}

// Handle settings
function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!isMuted) {
    muteBtn.innerText = "🐵";
    isMuted = true;
  } else {
    muteBtn.innerText = "🙊";
    isMuted = false;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!isCameraOff) {
    cameraBtn.innerText = "🙉";
    isCameraOff = true;
  } else {
    cameraBtn.innerText = "🙈";
    isCameraOff = false;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
  await getMedia();
  makeConnection();
}

function handleUI(isRoomFull) {
  if (isRoomFull) {
    call.style.setProperty("display", "none", "important");
    welcome.style.display = "block";
  } else {
    welcome.style.display = "none";
    call.style.display = "block";
  }
}

async function handleWelcomeSubmit(e) {
  e.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Send Messages
const message = document.getElementById("message");
const messageForm = message.querySelector("form");
const messageContent = message.querySelector("ul");

function handleMessageSubmit(e) {
  e.preventDefault();
  if (myDataChannel !== undefined) {
    const input = messageForm.querySelector("textarea");
    myDataChannel.send(input.value);
    appendMessage("me", input.value);
    input.value = "";
  } else {
    alert("Please wait until someone joins this room :)");
  }
}

function handleAlertMsg(isShow, msg) {
  if (isShow) {
    alertMsg.textContent = msg;
    alertMsg.style.display = "block";
  } else {
    alertMsg.style.display = "none";
  }
}

messageForm.addEventListener("submit", handleMessageSubmit);

// Socket Code
function appendMessage(flag, msg) {
  const msgContainer = document.createElement("li");
  msgContainer.className = flag;
  msgContainer.innerText = msg;
  messageContent.append(msgContainer);
  messageContent.scrollTop = messageContent.scrollHeight;
}

socket.on("welcome", async () => {
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", (msg) => {
    appendMessage("you", msg.data);
  });
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  myPeerConnection.addEventListener("datachannel", (e) => {
    myDataChannel = e.channel;
    myDataChannel.addEventListener("message", (msg) => {
      appendMessage("you", msg.data);
    });
  });
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
});

socket.on("room_full", () => {
  isRoomFull = true;
  handleUI(true);
  handleAlertMsg(true, "⚠️ This room is already packed!");
  setTimeout(() => {
    handleAlertMsg(false);
  }, 2000);
});

socket.on("join", async () => {
  handleUI(false);
});

// RTC Code
async function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });

  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("track", handleTrack);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
}

function handleTrack(data) {
  const peerFace = document.querySelector("#peerFace");
  peerFace.srcObject = data.streams[0];
}
