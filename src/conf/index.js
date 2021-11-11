import CONFIG from './config.json'

class Config {
  getLocalIp() { return CONFIG.localIp; }
  getLocalPort() { return CONFIG.localPort; }
  getLocalUrl() { return `http://${this.getLocalIp()}:${this.getLocalPort()}`; }
}

const config = new Config();

export { config }
