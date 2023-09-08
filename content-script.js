console.log("start");

function detectBrowser() {
  if (
    (navigator.userAgent.indexOf("Opera") ||
      navigator.userAgent.indexOf("OPR")) != -1
  ) {
    return 1;
  } else if (navigator.userAgent.indexOf("Chrome") != -1) {
    return 1;
  } else if (navigator.userAgent.indexOf("Safari") != -1) {
    return 2;
  } else if (navigator.userAgent.indexOf("Firefox") != -1) {
    return 2;
  } else if (
    navigator.userAgent.indexOf("MSIE") != -1 ||
    !!document.documentMode == true
  ) {
    return 1; //crap
  } else {
    return 2;
  }
}

var browserData = detectBrowser();
var browsertype = browserData == 1 ? chrome : browser;

var mainDiv = document.createElement("div");

mainDiv.innerHTML = `<div id="mydiv" class="main-extension">
  <style>
    .main-extension {
      background-color: #fff;
      height: 375px;
      width: 300px;
      position: absolute;
      top: 2%;
      right: 2%;
      border-radius: 10px 10px 10px 10px;
      border: 2px solid #e0e0e0;
      border-right: 0;
      font-family: monospace;
      z-index: 1000000;
    }
    #mydivheader{
      height: 30px;
      text-align: right;
      border-bottom: 1px solid #cacaca;
      cursor: move;
    }
    .main-extension-div {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 90%;
    }
    #record-button {
      width: 150px;
      height: 150px;
      cursor: pointer;
      background: linear-gradient(145deg, #f0f0f0, #cacaca);
      box-shadow: 29px 29px 51px #bababa, -29px -29px 51px #ffffff;
      border-radius: 50%;
      border: none;
      font-size: 30px;
      color: #868686;
    }
    #cross-button {
      height: 65%;
      padding: 5px 9px;
      cursor: pointer;
    }
  </style>
  <div id="mydivheader">
    <img id="cross-button" />
  </div>
  <div class="main-extension-div">
    <button id="record-button">Record</button>
  </div>
  </div>`;

var recording = false
var audioStream;

var sideDivVisible = false;
var inMeeting = false;
mainDiv.style.display = "none";
document.body.appendChild(mainDiv);

var chunks = {}
var index = 0

const mergeAndDownloadChunks = () => {
  const chunkKeys = Object.keys(chunks);
  if (chunkKeys.length >= 5) {
    const mergedBlob = new Blob(chunkKeys.slice(0, 5).map(key => chunks[key]), { type: 'audio/wav' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(mergedBlob);
    downloadLink.download = 'merged_audio.wav';
    downloadLink.click();
    chunkKeys.slice(0, 5).forEach(key => delete chunks[key]);
  }
};

const convertBlobToBase64 = blob => new Promise(resolve => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
  };
});
const sendAudioDataToServiceWorker = async (chunk) => {
  chunks[index] = chunk;
  index++;
  mergeAndDownloadChunks()

  const base64 = await convertBlobToBase64(chunk)
  try {
    await chrome.runtime.sendMessage({ type: "LOADED_FILE", base64: base64 });
  } catch (error) {
    console.error('Error sending audio data to background script:', error);
  }
};

var mediaRecorder;

const handleAudioStream = async (audioStream) => {
  mediaRecorder = new MediaRecorder(audioStream);
  mediaRecorder.start(3000);
  mediaRecorder.ondataavailable = (e) => {
    const chunk = e.data;
    sendAudioDataToServiceWorker(chunk)
  };
};

const showSideDiv = () => {
  mainDiv.style.display = "block";
  sideDivVisible = true;

  const recordButton = document.getElementById("record-button")
  recordButton.addEventListener('click',async ()=>{
    if (recording){
      mediaRecorder.stop();
      if (audioStream) {
        const tracks = audioStream.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
      }
      recordButton.innerText = "Record"
      recordButton.style.background = "linear-gradient(145deg, #f0f0f0, #cacaca)"
      recording = false
    }
    else {
      navigator.mediaDevices.getUserMedia({ audio: true })
      .then((audioStream) => {
        handleAudioStream(audioStream);
        recording = true;
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
        // Handle the error, notify the user, or provide guidance on resolving it.
      });
      recordButton.innerText = "Stop"
      recordButton.style.background = "linear-gradient(145deg, #cacaca, #f0f0f0)"
      recording = true
    }
  })
  const crossButton = document.getElementById("cross-button")
  crossButton.src = browsertype.runtime.getURL("/img/cross.png")
  crossButton.addEventListener('click',() => {
    mainDiv.style.display = "none";
  })
};

browsertype.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request) {
    console.log(request)
    if (request.msg == "Button") {
      showSideDiv();
    } else {
      console.log(request);
    }
  }
  setTimeout(function() {
    sendResponse({status: true});
  }, 1);
});

console.log("done");

// Make the DIV element draggable:
dragElement(document.getElementById("mydiv"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
