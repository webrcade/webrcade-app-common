import React from "react";

const isXbox = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes("xbox");
}

const isIos = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /ipad|iphone|ipod/.test(userAgent);
}

const isMacOs = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /mac os/.test(userAgent);
}

const isMobileSafari = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('safari/') &&
    userAgent.includes('mobile/') &&
    userAgent.includes('version/');
}

const iosNavBarHackListener = () => {
  document.body.style.overflow = 'scroll';
  window.scrollTo(0, 0);
  setTimeout(() => {
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 1);
    setTimeout(() => window.scrollTo(0, 0), 50);
  }, 500);
}

const applyIosNavBarHack = () => {
  if (isMobileSafari()) {
    window.addEventListener('orientationchange', iosNavBarHackListener);
  }
}

const removeIosNavBarHack = () => {
  if (isMobileSafari()) {
    window.removeEventListener('orientationchange', iosNavBarHackListener);
  }
}

let xboxIntervalId = null;

const addXboxFullscreenCallback = (cb) => {
  document.addEventListener('keydown', (e) => {
    if (e.keyCode === 208) {
      setTimeout(() => {
        if (!document.hasFocus()) {
          if (!xboxIntervalId) {
            // Callback
            cb(true);
            // Watch until focus is restored
            xboxIntervalId = setInterval(() => {
              if (document.hasFocus()) {
                cb(false);
                clearInterval(xboxIntervalId);
                xboxIntervalId = null;
              }
            }, 100);
          }
        }
      }, 500);
    }
  });
}

const getXboxViewMessage = () => {
  return (
      <div style={{ textAlign: 'center' }}>
        Due to an apparent bug in the Xbox Edge browser, focus is lost when the <b>View</b> button is pressed.<br /><br />
        To restore focus, open and close the <b>Guide menu</b> by pressing the controller's <b>Xbox</b> button twice.<br /><br />
        Please use the alternate buttons for <b>Select</b>, <b>Start</b>, and <b>Show Pause Dialog</b> actions. <br />
        See the "Xbox Series X|S Platform" section in the webRcade documentation.<br />
        <a href="https://docs.webrcade.com/platforms/xbox">docs.webrcade.com/platforms/xbox</a>
      </div>
  );
}


const isTouchSupported = () => {
  return matchMedia('(hover: none)').matches;
}

export {
  isMacOs,
  isXbox,
  isIos,
  isMobileSafari,
  applyIosNavBarHack,
  removeIosNavBarHack,
  isTouchSupported,
  addXboxFullscreenCallback,
  getXboxViewMessage
}
