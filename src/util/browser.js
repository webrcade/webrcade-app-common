
const isXbox = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes("xbox");
}

const isMobileSafari = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('safari/') &&
    userAgent.includes('mobile/') &&
    userAgent.includes('version/');
}

const applyIosNavBarHack = () => {
  if (isMobileSafari()) {
    window.addEventListener('orientationchange', () => {
      document.body.style.overflow = 'scroll';
      window.scrollTo(0, 0);
      setTimeout(() => {
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 1);
        setTimeout(() => window.scrollTo(0, 0), 50);
      }, 500);
    });
  }
}

const applyXboxFullscreenHack = () => {
  document.addEventListener('keydown', (e) => {
    if (e.keyCode === 208) {
        setTimeout(() => {
            if (!document.hasFocus()) {
                window.alert(
                  "Due to an apparent bug in the Xbox Edge browser, focus is lost when the \"View\" button is pressed. This dialog is being displayed in an attempt to restore focus.\n\n" +
                  "Please use the alternate buttons for \"Select\", \"Start\", and \"Show Pause Dialog\" actions. (see the \"Xbox Series X|S Platform\" section in the webRcade documentation).\n\n" +
                  "https://docs.webrcade.com/platforms/xbox\n(\"Alternate controls\" section)\n\n" +
                  "Press the \"B\" button to continue."
                );
                window.focus();
            }
        }, 500);
    }
  });
}

const isTouchSupported = () => {
  return matchMedia('(hover: none)').matches;
}

export { isXbox, isMobileSafari, applyIosNavBarHack, isTouchSupported, applyXboxFullscreenHack }
