const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let isMuted = false;
let isCameraOff = false;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    console.log(cameras);
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.error(e);
  }
}

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = myStream;
    await getCameras();
  } catch (e) {
    console.error(e);
  }
}

getMedia();

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!isMuted) {
    muteBtn.innerText = "Unmute";
    isMuted = true;
  } else {
    muteBtn.innerText = "Mute";
    isMuted = false;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
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
