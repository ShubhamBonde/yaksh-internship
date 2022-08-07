let shouldStop = false;
let stopped = false;
const videoElement = document.getElementsByTagName("video")[0];
const downloadLink = document.getElementById("download");
const stopButton = document.getElementById("stop");
const startExam = document.getElementById("startExam");

startExam.onclick = function () {
  location.href = "start-exam/";
  recordScreen();
};

function startRecord() {
  $(".btn-info").prop("disabled", true);
  $("#stop").prop("disabled", false);
  $("#download").css("display", "none");
}
function stopRecord() {
  $(".btn-info").prop("disabled", false);
  $("#stop").prop("disabled", true);
  $("#download").css("display", "block");
}
const audioRecordConstraints = {
  echoCancellation: true,
};

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

  //   window.addEventListener("load", (event) => {
  //     recordScreen();
  //   });

  mediaRecorder.onstop = function () {
    const blob = new Blob(recordedChunks, {
      type: mimeType,
    });
    recordedChunks = [];
    const filename = window.prompt("Enter file name");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${filename || "recording"}.mp4`;
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
  //   handleRecord({ stream, mimeType });
}

async function recordScreen() {
  recordVideo();
  const mimeType = "video/mp4";
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
