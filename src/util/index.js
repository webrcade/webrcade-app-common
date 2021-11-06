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

function isStaging() {
  return (window.location.href.toLowerCase().indexOf('/webrcade-staging/') != -1)
}

export {
  cloneObject,
  isDev,
  isStaging,
  preloadImages
};
