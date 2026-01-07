import { AppPrefs } from "../prefs";

export const BILINEAR_MODE = {
  BL_SHARP: "sharp",
  BL_SOFT: "soft",
  BL_OFF: "off",
}

export class NewRetroPrefs extends AppPrefs {
  constructor(emu) {
    super(emu);

    this.emu = emu;
    const app = emu.getApp();

    this.bilinearPath = app.getStoragePath(`${this.PREFS_PREFIX}.bilinearMode`);
    this.bilinearMode = BILINEAR_MODE.BL_SHARP;
  }

  async load() {
    await super.load();
    this.bilinearMode = await super.loadValue(
      this.bilinearPath,
      this.bilinearMode,
    );
  }

  async save() {
    await super.save();
    await super.saveValue(this.bilinearPath, this.bilinearMode);
  }

  getBilinearMode() {
    return this.bilinearMode;
  }

  setBilinearMode(mode) {
    this.bilinearMode = mode;
  }
}

