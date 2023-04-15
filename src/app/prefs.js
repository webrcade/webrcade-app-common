import { BaseSettings } from "../settings";

export class AppPrefs extends BaseSettings {
  PREFS_PREFIX = 'prefs';

  constructor(emu) {
    super(emu.getStorage());

    this.emu = emu;
    const app = emu.getApp();

    this.bilinearPath = app.getStoragePath(`${this.PREFS_PREFIX}.forceBilinear`);
    this.bilinearEnabled = false;
  }

  async load() {
    this.bilinearEnabled = await super.loadBool(
      this.bilinearPath,
      this.bilinearEnabled,
    );
  }

  async save() {
    await super.saveBool(this.bilinearPath, this.bilinearEnabled);
  }

  isBilinearEnabled() {
    return this.bilinearEnabled;
  }

  setBilinearEnabled(enabled) {
    this.bilinearEnabled = enabled;
  }
}
