import { BaseSettings } from "./base";
import { storage } from "../storage/storage.js"
import * as LOG from "../log";
import { AppRegistry } from "../apps"

class Settings extends BaseSettings {
  constructor(storage) {
    super(storage);
    this.expApps = false;
    this.vsync = true;
    this.bilinearFilter = false;
    this.cloudStorage = false;
    this.hideTitleBar = false;
    this.dbToken = null;
    this.screenSize = "native";
  }

  PREFIX = "wrcSettings.";
  EXP_APPS_PROP = this.PREFIX + "expApps";
  VSYNC_PROP = this.PREFIX + "vsync";
  BILINEAR_FILTER_PROP = this.PREFIX + "bilinearFilter";
  SCREEN_SIZE_PROP = this.PREFIX + "screenSize";
  CLOUD_STORAGE_PROP = this.PREFIX + "cloudStorage";
  HIDE_TITLE_BAR_PROP = this.PREFIX + "hideTitleBar";
  DB_TOKEN = this.PREFIX + "dbToken";

  async load() {
    LOG.info("Loading settings.");
    this.expApps = await this.loadBool(this.EXP_APPS_PROP, this.expApps);
    this.vsync = await this.loadBool(this.VSYNC_PROP, this.vsync);
    this.cloudStorage = await this.loadBool(this.CLOUD_STORAGE_PROP, this.cloudStorage);
    this.bilinearFilter = await this.loadBool(this.BILINEAR_FILTER_PROP, this.bilinearFilter);
    this.hideTitleBar = await this.loadBool(this.HIDE_TITLE_BAR_PROP, this.hideTitleBar);
    this.dbToken = await this.loadValue(this.DB_TOKEN, this.dbToken);
    this.screenSize = await this.loadValue(this.SCREEN_SIZE_PROP, this.screenSize);

    AppRegistry.instance.enableExpApps(this.expApps);
  }

  async save() {
    LOG.info("Saving settings.");
    await this.saveBool(this.EXP_APPS_PROP, this.expApps);
    await this.saveBool(this.VSYNC_PROP, this.vsync);
    await this.saveBool(this.CLOUD_STORAGE_PROP, this.cloudStorage);
    await this.saveBool(this.BILINEAR_FILTER_PROP, this.bilinearFilter);
    await this.saveBool(this.HIDE_TITLE_BAR_PROP, this.hideTitleBar);
    await this.saveValue(this.DB_TOKEN, this.dbToken);
    await this.saveValue(this.SCREEN_SIZE_PROP, this.screenSize);
    AppRegistry.instance.enableExpApps(this.expApps);
  }

  isExpAppsEnabled() {
    return this.expApps;
  }

  setExpAppsEnabled(b) {
    this.expApps = b;
  }

  getDbToken() {
    return this.dbToken;
  }

  setDbToken(t) {
    this.dbToken = t;
  }

  isCloudStorageEnabled() {
    return this.cloudStorage;
  }

  setCloudStorageEnabled(b) {
    this.cloudStorage = b;
  }

  isVsyncEnabled() {
    return this.vsync;
  }

  setVsyncEnabled(b) {
    this.vsync = b;
  }

  isBilinearFilterEnabled() {
    return this.bilinearFilter;
  }

  setBilinearFilterEnabled(b) {
    this.bilinearFilter = b;
  }

  getHideTitleBar() {
    return this.hideTitleBar;
  }

  setHideTitleBar(b) {
    this.hideTitleBar = b;
  }

  getScreenSize() {
    return this.screenSize;
  }

  setScreenSize(s) {
    this.screenSize = s;
  }
}

const settings = new Settings(storage);
export { settings };
