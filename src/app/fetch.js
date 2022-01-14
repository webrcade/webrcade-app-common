import { config } from '../conf'
import { isDev, limitString } from '../util';
import { remapUrl } from './remapurl.js';
import * as LOG from '../log';

export class FetchAppData {
  constructor(url) {
    this.url = remapUrl(url);
    this.retries = 1;
    this.proxyDisabled = false;
  }

  P = (isDev() ? (config.getLocalIp() + "/?y=") : config.getCorsProxy());

  getHeaders(res) {
    const headers = res.headers;
    const headerObj = {};
    if (headers) {
      const keys = headers.keys();
      let header = keys.next();
      while (header.value) {
        headerObj[header.value] = headers.get(header.value);
        header = keys.next();
      }
    }
    return headerObj;
  };

  setRetries(retries) {
    this.retries = retries;
    return this;
  }

  setProxyDisabled(disabled) {
    this.proxyDisabled = disabled;
    return this;
  }

  isProxyDisabled() {
    return this.proxyDisabled || !this.P || this.P.length === 0;
  }

  async fetch(props) {
    const { P, retries, proxyDisabled } = this;
    const url = this.url;
    const s = url.toLowerCase().startsWith("https");
    const h = s => (s ? "https://" : "http://");

    const getText = async r => {
      const text = await r.text();
      if (r.status === 404) {
        return "404 (Not found)";
      }
      return `${r.status}: ${limitString(text, 80)}`;
    };

    const doFetch = async url => {
      const res = await fetch(url, props);
      if (res.ok) {
        return res;
      } else {
        throw new Error(await getText(res));
      }
    }

    let res = null;
    let error = null;
    for (let x = 0; x <= retries; x++) {
      if (x > 0) {
        LOG.info("Retry: " + x);
      }
      try {
        res = await doFetch(url);
        if (!res) throw new Error("result is undefined");
        return res;
      } catch (e) {
        LOG.error(e);
        if (!this.isProxyDisabled()) {
          try {
            res = await doFetch(`${h(s)}${P}${encodeURIComponent(encodeURI(url))}`);
            if (!res) throw new Error("result is undefined");
            return res;
          } catch (e) {
            LOG.error(e);
            try {
              res = await doFetch(`${h(!s)}${P}${encodeURIComponent(encodeURI(url))}`);
              if (!res) throw new Error("result is undefined");
              return res;
            } catch (e) {
              LOG.error(e);
              error = e;
            }
          }
        }
      }
    }
    throw error;
  }
}
