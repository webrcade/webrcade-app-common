import * as LOG from '../log'
import { isDebug, uuidv4 } from '../util'

const DB_PREFIX = "https://www.dropbox.com/";
const DB_REMAP_PREFIX = "https://dl.dropboxusercontent.com/";
const GDRIVE_PREFIX ="https://drive.google.com/file/d/";
const GDRIVE_REMAP_PREFIX = "https://drive.google.com/uc?export=download&id=";
const BOX_PREFIX = "https://app.box.com/file/"; 

const IMG_PREFIX = "https://play.webrcade.com/default-feed/images/";
const IMG_REMAP_PREFIX = "https://webrcade.github.io/webrcade-default-feed/images/";
const CONTENT_PREFIX = "https://raw.githubusercontent.com/webrcade/webrcade/master/public/default-feed/content/";
const CONTENT_REMAP_PREFIX = "https://raw.githubusercontent.com/webrcade/webrcade-default-feed/main/content/";

const remapDropbox = (urlLower, url) => {
  // Check for Dropbox
  if (urlLower.substring(0, DB_PREFIX.length) === DB_PREFIX) {
    if (urlLower.includes("&rlkey=") || urlLower.includes("?rlkey=")) {
      url = url.replace("dl=0", "dl=1");
      url = url.replace(DB_PREFIX, "https://dl.dropbox.com/");
      LOG.info("Remapped dropbox url: '" + url + "'");
      return url;
    } else {
      url = DB_REMAP_PREFIX + url.substring(DB_PREFIX.length);
      url = url.split('?')[0];
      if (isDebug()) {
        LOG.info("Remapped dropbox url: '" + url + "'");
      }
      return url;
    }
  }
  return null;
}

const remapGdrive = (urlLower, url) => {
  // Check for Gdrive
  if (urlLower.substring(0, GDRIVE_PREFIX.length) === GDRIVE_PREFIX) {
    url = GDRIVE_REMAP_PREFIX + url.substring(GDRIVE_PREFIX.length);
    url = url.split('/view')[0];
    url += "&confirm=t";
    if (isDebug()) {
      LOG.info("Remapped Gdrive url: '" + url + "'");
    }
    return url;
  }
  return null;
}

const remapBox = (urlLower, url) => {
  // Check for Box.com shared file prefix
  if (urlLower.substring(0, BOX_PREFIX.length) === BOX_PREFIX) {
    const fileId = url.substring(BOX_PREFIX.length).split('?')[0];
    const sharedNameMatch = url.match(/[?&]s=([^&]+)/);
    if (!sharedNameMatch) {
      return null; // Return null if the 's' parameter (SHARED-NAME) is missing
    }
    const sharedName = sharedNameMatch[1];
    url = `https://app.box.com/index.php?rm=box_download_shared_file&shared_name=${sharedName}&file_id=f_${fileId}`;
    if (isDebug()) {
      LOG.info("Remapped Box.com url: '" + url + "'");
    }
    return url;
  }
  return null;
};

const remapOldDefaultImage = (urlLower, url) => {
  if (urlLower.substring(0, IMG_PREFIX.length) === IMG_PREFIX) {
    url = IMG_REMAP_PREFIX + url.substring(IMG_PREFIX.length);
    if (isDebug()) {
      LOG.info("Remapped old image url: '" + url + "'");
    }
    return url;
  }
  return null;
}

const remapOldContentUrl = (urlLower, url) => {
  if (urlLower.substring(0, CONTENT_PREFIX.length) === CONTENT_PREFIX) {
    url = CONTENT_REMAP_PREFIX + url.substring(CONTENT_PREFIX.length);
    if (isDebug()) {
      LOG.info("Remapped old content url: '" + url + "'");
    }
    return url;
  }
  return null;
}

const remapUrl = (url) => {
  if (!url) return url;
  const urlLower = url.toLowerCase();

  let newUrl = remapOldDefaultImage(urlLower, url);
  if (newUrl) return newUrl;

  newUrl = remapOldContentUrl(urlLower, url);
  if (newUrl) return newUrl;

  newUrl = remapDropbox(urlLower, url);
  if (newUrl) return newUrl;

  newUrl = remapGdrive(urlLower, url);
  if (newUrl) return newUrl;

  newUrl = remapBox(urlLower, url);
  if (newUrl) return newUrl;

  return url;
}

export { remapUrl };
