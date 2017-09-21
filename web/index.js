let video = document.getElementById("video");
let stream = null;

let resolution = {
  width: { exact: 640 },
  height: { exact: 480 }
  //,frameRate: { ideal: 5, max: 5 }
};

let mediaRecorder;
function record() {
  const options = { mimeType: "video/webm" };
  const recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.addEventListener("dataavailable", function(e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  });

  mediaRecorder.addEventListener("stop", function() {
    let downloadLink = document.getElementById("download");
    let blob = new Blob(recordedChunks);

    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "blah.webm";

    var formdata = new FormData();
    formdata.append('video', blob);

    var xhr = new XMLHttpRequest();
    
    xhr.open("POST", "/save", true);
    // xhr.send();
    xhr.send(formdata);
    
  });

  mediaRecorder.start();
}

function stop() {
  mediaRecorder.stop();
}

function startCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: resolution, audio: false })
    .then(function(s) {
      stream = s;
      video.srcObject = s;
      video.play();
    })
    .then(record)
    .catch(function(err) {
      console.log("An error occured! " + err);
    });

  video.addEventListener(
    "canplay",
    function(ev) {
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
