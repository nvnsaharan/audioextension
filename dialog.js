document.addEventListener(
  "DOMContentLoaded",
  async function () {
    var browserData = detectBrowser();
    var browsertype = browserData == 1 ? chrome : browser;

    browsertype.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      browsertype.tabs.sendMessage(
        tabs[0].id,
        { msg: "Button" },
        (response) => {
          if (response) {
            console.log(response);
          }
        }
      );
    });
  },
  false
);

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
