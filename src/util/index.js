export * from './url.js'
export * from './md5.js'
export * from './stringutil.js'
export * from './browser.js'

const preloadImages = (images) => {
  images.forEach((image) => {
    const img = new Image();
    img.src = image;
  });
};

export { preloadImages };
