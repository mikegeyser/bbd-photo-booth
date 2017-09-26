let recording = false;
let gifShown = false;
let gifElement, videoElement, loadingElement;

function clickButton() {
  if (gifShown) {
    gifShown = false;
    gifElement.src = "";
    gifElement.style.display = "none";
    videoElement.style.display = "block";
  } else {
    startCountdown();
  }
}

function startCountdown() {
  if (!recording) {
    recording = true;
    let timer = 3;

    let overlay = document.getElementById("overlay");
    overlay.style.display = "block";
    overlay.innerHTML = timer.toString();

    let intervalId = setInterval(() => {
      timer--;
      overlay.innerHTML = timer.toString();
      if (timer <= 0) {
        clearInterval(intervalId);
        overlay.style.display = "none";
        record();
      }
    }, 1000);
  }
}


let video = document.getElementById("video");
let stream = null;

let resolution = {
  width: { exact: 640 },
  height: { exact: 480 }
  //,frameRate: { ideal: 5, max: 5 }
};

let mediaRecorder;
function record() {
  console.log("recording...")
  const options = { mimeType: "video/webm" };
  const recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.addEventListener("dataavailable", function (e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  });

  mediaRecorder.addEventListener("stop", function () {
    loadingElement.style.display = "block";
    let downloadLink = document.getElementById("download");
    let blob = new Blob(recordedChunks);

    var formdata = new FormData();
    formdata.append('video', blob);

    var xhr = new XMLHttpRequest();

    xhr.open("POST", "/save", true);
    // xhr.send();
    xhr.send(formdata);

    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        loadingElement.style.display = "none";
        gifElement.style.display = "block";
        videoElement.style.display = "none";
        gifElement.src = xhr.responseText;
        gifShown = true;
      }
    };

  });

  mediaRecorder.start();

  stop();
}

function stop() {

  let recordDiv = document.getElementById("recording");
  recordDiv.style.display = "block";
  setTimeout(() => {
    mediaRecorder.stop();
    recordDiv.style.display = "none";
    recording = false;
  }, 3000);
}

function startCamera() {
  loadingElement = document.getElementById("load")
  gifElement = document.getElementById("gif");
  videoElement = document.getElementById("video");

  loadingElement.style.display = "none";
  gifElement.style.display = "none";
  videoElement.style.display = "block";

  navigator.mediaDevices
    .getUserMedia({ video: resolution, audio: false })
    .then(function (s) {
      stream = s;
      video.srcObject = s;
      video.play();
    })
    .catch(function (err) {
      console.log("An error occured! " + err);
    });

  video.addEventListener(
    "canplay",
    function (ev) {
      height = video.videoHeight;
      width = video.videoWidth;
      video.setAttribute("width", width);
      video.setAttribute("height", height);
      streaming = true;
    },
    false
  );
}

startCamera();
