import { config } from '../conf'

export * from './url.js'
export * from './md5.js'
export * from './stringutil.js'
export * from './browser.js'
export * from './uuid.js'

const cloneObject = (obj) => {
  return JSON.parse(JSON.stringify(obj));
}

const preloadImages = (images) => {
  images.forEach((image) => {
    const img = new Image();
    img.src = image;
  });
};

function isDev() {
  return process.env.NODE_ENV !== 'production';
}

function isApp() {
  return (window.location.href.toLowerCase().indexOf('/app/') != -1) ||
    (window.self !== window.top);
}

function resolvePath(path) {
  return isDev() ? `${config.getLocalUrl()}/${path}` :
    isApp() ? `../../${path}` : path;
};

export {
  cloneObject,
  resolvePath,
  isApp,
  isDev,
  preloadImages
};
