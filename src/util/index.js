//import { AppProps } from '../app';
import { UrlUtil } from './url';
import { config } from '../conf';
import { strReplaceAll } from './stringutil.js';

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
}

function normalizeFileName(name) {
  name = strReplaceAll(name, '?', '_');
  name = strReplaceAll(name, '*', '_');
  name = strReplaceAll(name, '/', '_');
  return name;
}

const RP_DEBUG = "debug";
let debug = ((typeof window !== "undefined") ? UrlUtil.getBoolParam(window.location.search, RP_DEBUG) : null);

function isDebug() {
  return debug;
}

export {
  RP_DEBUG,
  cloneObject,
  normalizeFileName,
  resolvePath,
  isApp,
  isDebug,
  isDev,
  preloadImages
};
