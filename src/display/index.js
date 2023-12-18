export * from './loop.js'
export * from './visibilitymonitor.js'
export * from './debug.js'

export async function getScreenShot(canvas, advanceCb, maxTries) {
  var offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
  var ctx = offscreenCanvas.getContext("2d");

  let i = 0;

  try {
    const doIt = async (advance) => {
      if (advance) {
        await advanceCb();
      }

      const result = canvas.toDataURL();
      ctx.drawImage(canvas,0,0);
      var imageData = ctx.getImageData(0,0, offscreenCanvas.width, offscreenCanvas.height);
//      console.log(imageData.data);

      let found = false;
      for( let i = 0; i < imageData.data.length; i++) {
        if ((imageData.data[i] !== 255) &&
            (imageData.data[i] !== 0)) {
          found = true;
          break;
        }
      }

      return found ? result : null;
    }

    for (i = 0; i < maxTries; i++) {
      let shot = null;
      try {
        shot = await doIt(false);
      } catch (e) {}
      if (shot) return shot;

      try {
        shot = await doIt(true);
      } catch (e) {}
      if (shot) return shot;
    }
  } finally {
    console.log("Tries: " + i);
    offscreenCanvas.remove();
  }

  return null;
}
