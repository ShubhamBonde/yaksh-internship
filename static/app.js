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
}

// change props of the html tags
function stopRecord() {
  $(".btn-info").prop("disabled", false);
  $("#stop").prop("disabled", true);
}

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

    var formdata = new FormData();
    formdata.append("blobFile", blob);

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

async function recordVideo() {
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
}

async function recordScreen() {
  recordVideo();
  const mimeType = "video/webm";
  shouldStop = false;
  const constraints = {
    video: {
      cursor: "motion",
    },
  };
  if (!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {
    return window.alert("Screen Record not supported!");
  }

  let stream = null;
  const displayStream = await navigator.mediaDevices.getDisplayMedia({
    video: { cursor: "motion" },
    audio: { echoCancellation: true },
  });
  // AudioContext is required for recording screen with audio
  const audioContext = new AudioContext();

  const voiceStream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true },
    video: false,
  });

  const userAudio = audioContext.createMediaStreamSource(voiceStream);

  const audioDestination = audioContext.createMediaStreamDestination();
  userAudio.connect(audioDestination);

  if (displayStream.getAudioTracks().length > 0) {
    const displayAudio = audioContext.createMediaStreamSource(displayStream);
    displayAudio.connect(audioDestination);
  }

  const tracks = [
    ...displayStream.getVideoTracks(),
    ...audioDestination.stream.getTracks(),
  ];

  stream = new MediaStream(tracks);
  handleRecord({ stream, mimeType });
}

window.addEventListener("load", (e) => {
  recordScreen();
});

// code for csrf token validation
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
