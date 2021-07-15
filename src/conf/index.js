import CONFIG from './config.json'

class Config {
  getLocalIp() { return CONFIG.localIp; }
}

const config = new Config();

export { config }
