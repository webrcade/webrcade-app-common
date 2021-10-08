import { config } from '../conf'
import { isDev } from '../dev';
import * as LOG from '../log';

export class FetchAppData {
  constructor(url) {
    this.url = url;
  }

  P = (isDev() ? (config.getLocalIp() + "/?y=") : "proxy.webrcade.workers.dev?");

  async fetch() {
    const { P } = this;
    const url = this.url;
    const s = url.toLowerCase().startsWith("https");
    const h = s => (s ? "https://" : "http://");
    const RETRIES = 1;

    const getText = async r => {
      const text = await r.text();
      return `${text}: ${r.status}`;
    };

    const doFetch = async url => {
      const res = await fetch(url);
      if (res.ok) {
        return res;
      } else {
        throw new Error(await getText(res));
      }
    }

    let res = null;
    let error = null;
    for (let x = 0; x <= RETRIES; x++) {
      if (x > 0) {
        LOG.info("Retry: " + x);
      }
      try {
        res = await doFetch(url);
        if (!res) throw new Error("result is undefined");
        return res;
      } catch (e) {
        LOG.error(e);
        try {
          res = await doFetch(`${h(s)}${P}${url}`);
          if (!res) throw new Error("result is undefined");
          return res;
        } catch (e) {
          LOG.error(e);
          try {
            res = await doFetch(`${h(!s)}${P}${url}`);
            if (!res) throw new Error("result is undefined");
            return res;
          } catch (e) {
            LOG.error(e);
            error = e;
          }
        }
      }
    }
    throw error;
  }
}
