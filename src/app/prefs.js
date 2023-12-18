import { BaseSettings } from "../settings";
import { SCREEN_SIZES } from "../settings";

export const SCREEN_CONTROLS = {
  SC_AUTO: "auto",
  SC_ON: "on",
  SC_OFF: "off",
}

export class AppPrefs extends BaseSettings {
  PREFS_PREFIX = 'prefs';

  constructor(emu) {
    super(emu.getStorage());

    this.emu = emu;
    const app = emu.getApp();

    this.bilinearPath = app.getStoragePath(`${this.PREFS_PREFIX}.forceBilinear`);
    this.screenSizePath = app.getStoragePath(`${this.PREFS_PREFIX}.screenSize`);
    this.screenControlsPath = app.getStoragePath(`${this.PREFS_PREFIX}.screenControls`);
    this.bilinearEnabled = false;
    this.screenSize = SCREEN_SIZES.SS_DEFAULT;
    this.screenControls = SCREEN_CONTROLS.SC_AUTO;
  }

  async load() {
    this.bilinearEnabled = await super.loadBool(
      this.bilinearPath,
      this.bilinearEnabled,
    );

    this.screenSize = await super.loadValue(
      this.screenSizePath,
      this.screenSize,
    );

    this.screenControls = await super.loadValue(
      this.screenControlsPath,
      this.screenControls,
    );
  }

  async save() {
    await super.saveBool(this.bilinearPath, this.bilinearEnabled);
    await super.saveValue(this.screenSizePath, this.screenSize);
    await super.saveValue(this.screenControlsPath, this.screenControls);
  }

  isBilinearEnabled() {
    return this.bilinearEnabled;
  }

  setBilinearEnabled(enabled) {
    this.bilinearEnabled = enabled;
  }

  getScreenSize() {
    return this.screenSize;
  }

  setScreenSize(size) {
    this.screenSize = size;
  }

  getScreenControls() {
    return this.screenControls;
  }

  setScreenControls(value) {
    this.screenControls = value;
  }
}
