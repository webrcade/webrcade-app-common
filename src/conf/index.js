import CONFIG from './config.json'

class Config {
  isEmptyDefault = true;

  getLocalIp() { return CONFIG.localIp; }
  getLocalExternalIp() { return CONFIG.localExternalIp; }
  getLocalPort() { return CONFIG.localPort; }
  getLocalUrl() { return `http://${this.getLocalIp()}:${this.getLocalPort()}`; }
  getCorsProxy() { return CONFIG.corsProxy ? CONFIG.corsProxy : null;  }
  getCorsProxyDev() { return CONFIG.corsProxyDev ? CONFIG.corsProxyDev : null;  }
  isPublicServer() { return CONFIG.isPublicServer === true; }
  getDefaultFeedContentRoot() { return CONFIG.defaultFeedContentRoot ? CONFIG.defaultFeedContentRoot : null; }
  getDefaultFeedImagesRoot() { return CONFIG.defaultFeedImagesRoot ? CONFIG.defaultFeedImagesRoot : null; }
  isEmptyDefaultFeed() { return this.isEmptyDefault; }
  setEmptyDefaultFeed(empty) { this.isEmptyDefault = empty; }
}

const config = new Config();

export { config }
