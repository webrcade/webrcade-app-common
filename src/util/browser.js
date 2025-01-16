import React from "react";
import UAParser from "ua-parser-js"
import * as LOG from '../log';

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

const isParentSameOrigin = () =>  {
  try {
    const href = window.parent.location.href;
    return href ;
  } catch (e) {
    return false;
  }
  return false;
}

const isStoragePersisted = async () => {
  return await navigator?.storage?.persisted();
}

const storagePersist = () => {
  (async () => {
    try {
      if (!await isStoragePersisted()) {
        LOG.info("Storage is not persisted long term.");
        LOG.info("Result of requesting long term storage: " + await navigator?.storage?.persist());
      } else {
        LOG.info("Storage is persisted long term.")
      }
    } catch (e) {
      LOG.error("Error requesting long term storage", e);
    }
  })();
}

const fullScreen = (elem) => {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

const isLocalhostOrHttps = () => {
  return window.location.hostname === 'localhost' || window.location.protocol === 'https:';
}

export {
  isParentSameOrigin,
  isMacOs,
  isStoragePersisted,
  isXbox,
  isIos,
  isMobileSafari,
  applyIosNavBarHack,
  fullScreen,
  removeIosNavBarHack,
  isTouchSupported,
  addXboxFullscreenCallback,
  getXboxViewMessage,
  storagePersist,
  isLocalhostOrHttps,
  UAParser
}
