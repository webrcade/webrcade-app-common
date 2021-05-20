
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

export { isXbox, isMobileSafari }
