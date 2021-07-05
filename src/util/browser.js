
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

const isTouchSupported = () => {
  return matchMedia('(hover: none)').matches;
}

export { isXbox, isMobileSafari, applyIosNavBarHack, isTouchSupported }
