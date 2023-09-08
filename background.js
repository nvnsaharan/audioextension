// const socket = new WebSocket('ws://your-server-address');

// socket.addEventListener('open', (event) => {
//   console.log('WebSocket connection opened.');
// });

var chunks = {}; // Use an object to store audio chunks with incrementing keys
var index = 0; // Initialize the index for audio chunks

const fetchBlob = async url => {
  const response = await fetch(url);
  const blob = await response.blob();
  const base64 = await convertBlobToBase64(blob);
  return base64;
};

chrome.runtime.onMessage.addListener( async(message, sender, sendResponse) => {
  if (message.type === "LOADED_FILE") {
    const response = await fetch(message.base64);
    const audioblob = await response.blob();
    console.log("Received audio data from content script", audioblob);
    chunks[index] = audioblob;
    console.log(chunks);
    index++;
    
    // try {
    //   // Send audio data to the WebSocket asynchronously
    //   await new Promise((resolve, reject) => {
    //     socket.send(message.audioData, (error) => {
    //       if (error) {
    //         console.error("Error sending audio data:", error);
    //         reject(error);
    //       } else {
    //         console.log("Audio data sent successfully");
    //         resolve();
    //       }
    //     });
    //   });
    // } catch (error) {
    //   console.error("Error sending audio data:", error);
    // }
  }
  sendResponse({status: true});
});

// socket.addEventListener('message', (event) => {
//   const messageData = event.data;
//   console.log('WebSocket message received:', messageData);

//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const activeTab = tabs[0];
//     chrome.scripting.executeScript({
//       target: { tabId: activeTab.id },
//       function: (message) => {
//         console.log('Message from WebSocket in content script:', message);
//       },
//       args: [messageData],
//     });
//   });
// });

// Handle WebSocket error event
// socket.addEventListener('error', (error) => {
//   console.error('WebSocket error:', error);
// });

// // Handle WebSocket close event
// socket.addEventListener('close', (event) => {
//   if (event.wasClean) {
//     console.log(`WebSocket connection closed cleanly, code=${event.code}, reason=${event.reason}`);
//   } else {
//     console.error('WebSocket connection died');
//   }
// });