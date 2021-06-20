import { isDev } from '../dev';
import * as LOG from '../log';

export class FetchAppData {
  constructor(url) {
    this.url = url;
  }

  P = (isDev() ? "192.168.1.179/?y=" : "proxy.webrcade.workers.dev?");

  async fetch() {
    const { P } = this;
    const url = this.url;
    const s = url.toLowerCase().startsWith("https");
    const h = s => (s ? "https://" : "http://");

    const getText = async r => {
      const text = await r.text();
      return `${text}: ${r.status}`;
    };

    const doFetch = url => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await fetch(url);
          if (res.ok) {
            resolve(res);
          } else {
            reject(await getText(res));
          }
        } catch (e) {
          reject(e);
        }
      });
    }

    try {
      return await doFetch(url);
    } catch (e) {
      LOG.error(e);
      try {
        return await doFetch(`${h(s)}${P}${url}`);
      } catch (e) {
        LOG.error(e);
        return await doFetch(`${h(!s)}${P}${url}`);
      }
    }
  }
}
