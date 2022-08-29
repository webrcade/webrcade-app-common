export * from './feed.js'
export * from './feeds.js'

import { Unzip } from '../zip/unzip.js';
import { Base64 } from '../util/base64.js';

const blobToJson = (blob) => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = async (e) => {
      try {
        const contents = e.target.result;
        resolve(JSON.parse(contents));
      } catch (e) {
        reject(e);
      }
    };
    fr.onerror = (e) => {
      reject(e);
    }
    fr.readAsText(blob)
  });
}

const getFeedAsJson = async (blob) => {
  // Check for zip (no-op if non zip)
  const uz = new Unzip().setDebug(true);
  blob = await uz.unzip(blob, [], []);

  // Read file
  const fileReader = new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = async (e) => {
      try {
        const contents = e.target.result;

        // Base 64
        let b = null;
        if (Base64.isBase64(contents)) {
          const b64 = await fetch("data:application/octet-stream;base64," + contents);
          b = await b64.blob();

          // Unzip (no-op if non zip)
          b = await uz.unzip(b, [], []);
        }

        // BLob to JSON
        resolve(b ? await blobToJson(b) : JSON.parse(contents));
      } catch (e) {
        reject('Error reading feed: ' + e);
      }
    };
    fr.onerror = (e) => {
      reject('Error reading feed: ' + e);
    }
    fr.readAsText(blob)
  });

  return await fileReader;
}

export { getFeedAsJson }
