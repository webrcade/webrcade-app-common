import * as LOG from '../../../log'

const CHEATS_PREF_KEY = 'prefs.enabledCheats';

export default class CheatsService {
  constructor(emulator) {
    this.emulator = emulator;
    this._raw = [];
    this._list = [];
  }

  _getStoragePath() {
    const { emulator } = this;
    return emulator.getApp().getStoragePath(`${emulator.uid}/${CHEATS_PREF_KEY}`);
  }

  async _load() {
    try {
      const val = await this.emulator.getStorage().get(this._getStoragePath());
      return val ? JSON.parse(val) : null;
    } catch (e) {
      return null;
    }
  }

  async _save(enabledDescs) {
    const path = this._getStoragePath();
    const storage = this.emulator.getStorage();
    if (enabledDescs && enabledDescs.length > 0) {
      await storage.put(path, JSON.stringify(enabledDescs));
    } else {
      await storage.remove(path);
    }
  }

  async preloadSaved() {
    this._savedDescs = await this._load();
    LOG.info(`[Cheats]: Preloaded saved prefs: ${this._savedDescs ? this._savedDescs.length : 0} enabled.`);
  }

  onCheatsLoadStart(count) {
    this._raw = new Array(count);
    this._list = [];
    LOG.info(`[Cheats]: Load started, ${count} cheats incoming.`);
  }

  onCheatAdded(idx, desc, enabled, code) {
    if (this._raw) {
      this._raw[idx] = { idx, code, desc, enabled: !!enabled };
      LOG.info(`[Cheats]: [${idx}] "${desc}" code=${code} enabled=${!!enabled}`);
    }
  }

  onCheatsLoadEnd() {
    // Dedup by desc (case-insensitive) — last entry with a given desc wins (highest idx)
    const byDesc = {};
    for (const c of this._raw) {
      if (c && c.desc && c.desc.trim()) byDesc[c.desc.toLowerCase()] = c;
    }

    // Sort alphabetically by desc
    const sorted = Object.values(byDesc).sort((a, b) =>
      a.desc.localeCompare(b.desc)
    );

    // Apply pre-loaded saved preferences (case-insensitive match)
    if (this._savedDescs && !this.emulator.isOneShotCheats()) {
      const enabledSet = new Set(this._savedDescs.map((d) => d.toLowerCase()));
      sorted.forEach((c) => {
        if (enabledSet.has(c.desc.toLowerCase())) {
          c.enabled = true;
          window.Module._wrc_cheat_toggle(c.idx, 1);
          LOG.info(`[Cheats]: Applied saved cheat "${c.desc}" (idx=${c.idx})`);
        }
      });
    }

    this._list = sorted;
    LOG.info(
      `[Cheats]: Load complete, ${this._list.length} cheats` +
      ` (deduped from ${this._raw.filter(Boolean).length}).`
    );
  }

  getList() {
    return this._list;
  }

  clear() {
    this._list.forEach((c) => {
      if (c.enabled) {
        c.enabled = false;
        window.Module._wrc_cheat_toggle(c.idx, 0);
      }
    });
  }

  add(cheat) {
    const item = this._list.find((c) => c.idx === cheat.idx);
    if (item) item.enabled = true;
    window.Module._wrc_cheat_toggle(cheat.idx, 1);
  }

  async save() {
    if (this.emulator.isOneShotCheats()) {
      // One-shot cheats (e.g. console commands) fire at the moment they are applied.
      // Reset all to off so the dialog always opens with a clean slate.
      this._list.forEach((c) => { c.enabled = false; });
      await this._save(null);
      return;
    }
    const descs = this._list.filter((c) => c.enabled).map((c) => c.desc.toLowerCase());
    await this._save(descs.length > 0 ? descs : null);
  }
}
