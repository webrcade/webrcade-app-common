import { BaseSettings } from "./base";
import { storage } from "../storage"
import { LOG } from "..";
import { AppRegistry } from "../apps"

class Settings extends BaseSettings {
  constructor(storage) {
    super(storage);
    this.expApps = false;
    this.vsync = true;
    this.bilinearFilter = false;
  }

  PREFIX = "wrcSettings.";
  EXP_APPS_PROP = this.PREFIX + "expApps";
  VSYNC_PROP = this.PREFIX + "vsync";
  BILINEAR_FILTER_PROP = this.PREFIX + "bilinearFilter";

  async load() {
    LOG.info("Loading settings.");
    this.expApps = await this.loadBool(this.EXP_APPS_PROP, this.expApps);
    this.vsync = await this.loadBool(this.VSYNC_PROP, this.vsync);
    this.bilinearFilter = await this.loadBool(this.BILINEAR_FILTER_PROP, this.bilinearFilter);
    AppRegistry.instance.enableExpApps(this.expApps);
  }

  async save() {
    LOG.info("Saving settings.");
    await this.saveBool(this.EXP_APPS_PROP, this.expApps);
    await this.saveBool(this.VSYNC_PROP, this.vsync);
    await this.saveBool(this.BILINEAR_FILTER_PROP, this.bilinearFilter);
    AppRegistry.instance.enableExpApps(this.expApps);
  }

  isExpAppsEnabled() {
    return this.expApps;
  }

  setExpAppsEnabled(b) {
    this.expApps = b;
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
}

const settings = new Settings(storage);
export { settings };
