let shouldStop = false;
let stopped = false;
let date = new Date();
const csrftoken = getCookie("csrftoken");
const videoElement = document.getElementsByTagName("video")[0];
const downloadLink = document.getElementById("download");
const stopButton = document.getElementById("stop");

// change props of the html tags
function startRecord() {
  $(".btn-info").prop("disabled", true);
  $("#stop").prop("disabled", false);
  $("#download").css("display", "none");
}

// change props of the html tags
function stopRecord() {
  $(".btn-info").prop("disabled", false);
  $("#stop").prop("disabled", true);
  $("#download").css("display", "block");
}

// const audioRecordConstraints = {
//     echoCancellation: true
// }

// works on click is pressed
stopButton.addEventListener("click", function () {
  shouldStop = true;
});

const handleRecord = function ({ stream, mimeType }) {
  startRecord();
  let recordedChunks = [];
  stopped = false;
  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = function (e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }

    if (shouldStop === true && stopped === false) {
      mediaRecorder.stop();
      stopped = true;
    }
  };

  mediaRecorder.onstop = function () {
    const blob = new Blob(recordedChunks, {
      type: mimeType,
    });

    recordedChunks = [];
    const filename =
      "exam_recording_" +
      date.getDate() +
      "/" +
      date.getMonth() +
      "/" +
      date.getFullYear() +
      "_" +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds();
    downloadLink.href = URL.createObjectURL(blob);
    console.log(URL.createObjectURL(blob));
    downloadLink.download = `${filename}.webm`;
    console.log(downloadLink.download);
    console.log(typeof URL.createObjectURL(blob));
    var formdata = new FormData();
    formdata.append("blobFile", blob, downloadLink.download);

    fetch("/uploader/post", {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest", //Necessary to work with request.is_ajax()
        "X-CSRFToken": csrftoken,
      },
      body: formdata,
    })
      .then((res) => res.json())
      .then(() => {
        alert("stream file uploaded successfully");
      });
    stopRecord();
    videoElement.srcObject = null;
  };

  mediaRecorder.start(200);
};

// async function recordAudio() {
//     const mimeType = 'audio/webm';
//     shouldStop = false;
//     const stream = await navigator.mediaDevices.getUserMedia({audio: audioRecordConstraints});
//     handleRecord({stream, mimeType})
// }

async function recordVideo() {
  const mimeType = "video/webm";
  shouldStop = false;
  const constraints = {
    audio: {
      echoCancellation: true,
    },
    video: {
      width: {
        min: 640,
        max: 1024,
      },
      height: {
        min: 480,
        max: 768,
      },
    },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoElement.srcObject = stream;
  handleRecord({ stream, mimeType });
}

window.addEventListener("load", (e) => {
  recordVideo();
});

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
