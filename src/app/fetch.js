export class FetchAppData {
  constructor(url) {
    this.url = url;
  }

  async fetch() {
    const url = this.url;
    try {
      return await fetch(url);
    } catch (ex) {
      return await fetch(`http://192.168.1.179/?y=${url}`)
    }
  }
}
