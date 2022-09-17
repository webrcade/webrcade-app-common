export class BaseSettings {
  constructor(storage) {
    this.storage = storage;
  }

  async loadBool(name, def = false) {
    const b = await this.storage.get(name);
    return b === null ? def : b === "true";
  }

  async saveBool(name, b) {
    await this.storage.put(name, b.toString());
  }

  async loadValue(name, def = null) {
    const val = await this.storage.get(name);
    return val === null ? def : val;
  }

  async saveValue(name, val) {
    if (val === null) {
      await this.storage.remove(name);
    } else {
      await this.storage.put(name, val);
    }
  }

  async load() {
  }

  async save() {
  }
}
