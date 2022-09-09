import {
  Dropbox,
  DropboxAuth,
} from 'dropbox';

import { Resources, TEXT_IDS } from '../../../resources';
import { settings } from '../../../settings';
import { uuidv4 } from '../../../util';
import * as LOG from '../../../log'

class WrcDropbox {
  static CLIENT_ID = "xvz6ybh9wta2u30";
  static PREFIX = "dropbox.";
  static CODE_VERIFIER_PROP = `${this.PREFIX}verifier`;
  static ERROR_DESC_PROP = `${this.PREFIX}errorDesc`;
  static CODE_PROP = `${this.PREFIX}code`;
  static RETURN_URI = `${this.PREFIX}returnUri`;
  static REDIRECT_URIS = [{
    uri: "http://localhost:3000",
    redirectUri: "http://localhost:3000/dropbox/"
  }, {
    uri: "http://localhost:3200",
    redirectUri: "http://localhost:3200/dropbox/"
  }, {
    uri: "http://localhost:8000",
    redirectUri: "http://localhost:8000/dropbox/"
  }, {
    uri: "http://localhost:8000/app/editor",
    redirectUri: "http://localhost:8000/app/editor/dropbox/"
  }, {
    uri: "http://localhost:8000/app/standalone",
    redirectUri: "http://localhost:8000/app/standalone/dropbox/"
  }, {
    uri: "https://play.webrcade.com",
    redirectUri: "https://play.webrcade.com/dropbox/"
  }, {
    uri: "https://play.webrcade.com/app/editor",
    redirectUri: "https://play.webrcade.com/app/editor/dropbox/"
  }, {
    uri: "https://play-staging.webrcade.com",
    redirectUri: "https://play-staging.webrcade.com/dropbox/"
  }, {
    uri: "https://play-staging.webrcade.com/app/editor",
    redirectUri: "https://play-staging.webrcade.com/app/editor/dropbox/"
  }];

  constructor() {
    this.dbx = null;
  }

  clearSession() {
    Object.keys(sessionStorage).forEach(function (key) {
      if (key.startsWith(WrcDropbox.PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  }

  getRedirectUri() {
    let redirectUri = null;
    let uriLen = 0;
    const currentUri = window.location.href.split('?')[0].toLowerCase();
    for (let i = 0; i < WrcDropbox.REDIRECT_URIS.length; i++) {
      const redir = WrcDropbox.REDIRECT_URIS[i];
      const uri = redir.uri;
      const redirUri = redir.redirectUri;
      if (currentUri.startsWith(uri)) {
        const len = uri.length;
        if (!redirectUri || (len > uriLen)) {
          redirectUri = redirUri;
          uriLen = len;
        }
      }
    }

    return redirectUri;
  }

  async getDropbox() {
    if (!this.dbx) {
      const token = settings.getDbToken();
      if (token) {
        const dbxAuth = new DropboxAuth({
          clientId: WrcDropbox.CLIENT_ID,
        });
        dbxAuth.setRefreshToken(token);
        this.dbx = new Dropbox({
          auth: dbxAuth
        });
      } else {
        throw "Dropbox token is not available.";
      }
    }
    if (this.dbx) {
      await this.dbx.auth.checkAndRefreshAccessToken();
    }
    return this.dbx;
  }

  async checkFileExists(path) {
    let exists = false;

    try {
      const dbx = await this.getDropbox();
      await dbx.filesGetMetadata({path: path});
      exists = true;
    } catch (e) {
      LOG.error(e);
    }
    return exists;
  }

  async deleteFile(path) {
    let ret = false;
    try {
      const dbx = await this.getDropbox();
      await dbx.filesDeleteV2({path: path});
      ret = true;
    } catch (e) {
      LOG.error(e);
    }
    return ret;
  }

  async downloadFile(path) {
    const dbx = await this.getDropbox();
    const result = await dbx.filesDownload({path: path});
    return result.result.fileBlob;
  }

  async uploadFile(blob, path) {
    const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;

    const dbx = await this.getDropbox();
    const file = new File([blob], path);

    if (file.size < UPLOAD_FILE_SIZE_LIMIT) { // File is smaller than 150 Mb - use filesUpload API
      await dbx.filesUpload({
        path: file.name,
        contents: file,
        mode: 'overwrite'
      })
      return true;
    } else { // File is bigger than 150 Mb - use filesUploadSession* API
      const maxBlob = 8 * 1000 * 1000; // 8Mb - Dropbox JavaScript API suggested max file / chunk size
      var offset = 0;

      // Create array of work items
      let sessionId = null;
      let idx = 0;
      while (offset < file.size) {
        const chunkSize = Math.min(maxBlob, file.size - offset);
        const blob = file.slice(offset, offset + chunkSize);
        if (offset === 0) {
          const response = await dbx.filesUploadSessionStart({ close: false, contents: blob });
          sessionId = response.result.session_id;
        } else if ((offset + chunkSize) === file.size) {
          const cursor = { session_id: sessionId, offset: file.size - blob.size };
          const commit = { path: file.name, mode: 'overwrite', autorename: true, mute: false };
          await dbx.filesUploadSessionFinish({ cursor: cursor, commit: commit, contents: blob });
          return true;
        } else {
          const cursor = { session_id: sessionId, offset: idx * maxBlob };
          await dbx.filesUploadSessionAppendV2({ cursor: cursor, close: false, contents: blob })
        }
        offset += chunkSize;
        idx++;
      }
      return false;
    }
  }

  async testWrite() {
    const path = `/_test_/${uuidv4()}`;
    const val = 123;
    try {
      let bytes = new Uint8Array(1);
      bytes[0] = val;
      await this.uploadFile(new Blob([bytes]), path);
      const blob = await this.downloadFile(path);
      const arrayBuffer = await blob.arrayBuffer();
      this.deleteFile(path);
      return new Uint8Array(arrayBuffer)[0] === val;
    } catch(e) {
      LOG.error(e);
    }
    return false;
  }

  async checkLinkResult() {
    try {
      const errorDesc = sessionStorage.getItem(WrcDropbox.ERROR_DESC_PROP);
      if (errorDesc) {
        throw errorDesc;
      }

      const verifier = window.sessionStorage.getItem(WrcDropbox.CODE_VERIFIER_PROP);
      const code = window.sessionStorage.getItem(WrcDropbox.CODE_PROP);
      const redirectUri = this.getRedirectUri();

      if (verifier && code && redirectUri) {
        const dbxAuth = new DropboxAuth({
          clientId: WrcDropbox.CLIENT_ID,
        });
        dbxAuth.setCodeVerifier(verifier);

        const response = await dbxAuth.getAccessTokenFromCode(redirectUri, code);
        const refreshToken = response.result.refresh_token;

        settings.setDbToken(refreshToken);
        await settings.save();
      }
    } finally {
      this.clearSession();
    }
  }

  async link(returnUri) {
    this.clearSession();

    const dbxAuth = new DropboxAuth({
      clientId: WrcDropbox.CLIENT_ID,
    });

    const redirectUri = this.getRedirectUri();
    if (!redirectUri) {
      throw Resources.getText(TEXT_IDS.DROPBOX_SERVER_UNAUTHORIZED);
    }
    const authUrl = await dbxAuth.getAuthenticationUrl(redirectUri, undefined, 'code', 'offline', undefined, undefined, true);
    window.sessionStorage.setItem(WrcDropbox.CODE_VERIFIER_PROP, dbxAuth.codeVerifier);
    if (returnUri) {
      window.sessionStorage.setItem(WrcDropbox.RETURN_URI, returnUri);
    }
    window.location.href = authUrl;
  }
}

const dropbox = new WrcDropbox();

export { dropbox }
