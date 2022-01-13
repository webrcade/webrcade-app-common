import CONFIG from './config.json'

class Config {
  isEmptyDefault = true;

  getLocalIp() { return CONFIG.localIp; }
  getLocalPort() { return CONFIG.localPort; }
  getLocalUrl() { return `http://${this.getLocalIp()}:${this.getLocalPort()}`; }
  getRawContentRoot() { return CONFIG.rawContentRoot ? CONFIG.rawContentRoot : null; }
  getCorsProxy() { return CONFIG.corsProxy ? CONFIG.corsProxy : null;  }
  isPublicServer() { return CONFIG.isPublicServer === true; }
  isEmptyDefaultFeed() { return this.isEmptyDefault; }
  setEmptyDefaultFeed(empty) { this.isEmptyDefault = empty; }
}

const config = new Config();

export { config }
