export class FetchAppData {
  constructor(url) {
    this.url = url;
  }

  P = "192.168.1.179/?y="

  async fetch() {
    const { P } = this;
    const url = this.url;
    const s = url.toLowerCase().startsWith("https");

    const h = s => (s ? "https://" : "http://");

    try {
      return await fetch(url);
    } catch (ex) {
      try {
        return await fetch(`${h(s)}${P}${url}`);
      } catch (ex) {
        return await fetch(`${h(!s)}${P}${url}`);
      }
    }
  }
}
