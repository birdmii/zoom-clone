const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream;
let isMuted = false;
let isCameraOff = false;

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = myStream;
  } catch (e) {
    console.error(e);
  }
}

getMedia();

function handleMuteClick() {
  if (!isMuted) {
    muteBtn.innerText = "Unmute";
    isMuted = true;
  } else {
    muteBtn.innerText = "Mute";
    isMuted = false;
  }
}
function handleCameraClick() {
  if (!isCameraOff) {
    cameraBtn.innerText = "Camera Off";
    isCameraOff = true;
  } else {
    cameraBtn.innerText = "Camera On";
    isCameraOff = false;
  }
}
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
