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

  async load() {
  }

  async save() {
  }
}
