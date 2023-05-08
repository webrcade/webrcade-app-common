import { BaseSettings } from "../settings";
import { SCREEN_SIZES } from "../settings";

export class AppPrefs extends BaseSettings {
  PREFS_PREFIX = 'prefs';

  constructor(emu) {
    super(emu.getStorage());

    this.emu = emu;
    const app = emu.getApp();

    this.bilinearPath = app.getStoragePath(`${this.PREFS_PREFIX}.forceBilinear`);
    this.screenSizePath = app.getStoragePath(`${this.PREFS_PREFIX}.screenSize`);
    this.bilinearEnabled = false;
    this.screenSize = SCREEN_SIZES.SS_DEFAULT;
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
  }

  async save() {
    await super.saveBool(this.bilinearPath, this.bilinearEnabled);
    await super.saveValue(this.screenSizePath, this.screenSize);
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
}
