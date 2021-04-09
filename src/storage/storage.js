class Storage {
  constructor() {
    this.initialized = false;
    this.localStorageAvailable = false;
    this.idxDb = null;
  }

  DB_NAME = "webrcade";
  DB_STORE = "STORAGE";
  UINT8_ARRAY_MARKER = "_u8a_:";

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    this.localStorageAvailable = this.checkLocalStorageAvailable();
    try {
      this.idxDb = await this.openIndexedDb();
    } catch (ex) {
      console.error("IndexDB error: " + ex);
    }
  }

  checkLocalStorageAvailable() {
    const TEST = '__test__';
    try {
      localStorage.setItem(TEST, TEST);
      localStorage.removeItem(TEST);
      console.info("Local storage is available.");
      return true;
    } catch (e) {
      console.info("Local storage is not available.");
    }
    return false;
  }

  async openIndexedDb() {
    const { DB_NAME, DB_STORE } = this;

    if (!window.indexedDB) {
      window.indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    }
    if (!window.IDBTransaction) {
      window.IDBTransaction = window.webkitIDBTransaction || window.msIDBTransaction;
    }
    if (!window.IDBKeyRange) {
      window.IDBKeyRange = window.webkitIDBKeyRange || window.msIDBKeyRange;
    }
    if (!window.indexedDB) {
      throw new Error("indexedDB is unavailable.")
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, 1);
      request.onerror = (e) => {
        console.log('Indexed DB error.');
        reject(e);
      };
      request.onsuccess = (e) => {
        console.log('Indexed DB success.');
        resolve(request.result);
      };
      request.onupgradeneeded = (e) => {
        try {
          console.log('Indexed DB upgrade.');
          var db = e.target.result;
          db.createObjectStore(DB_STORE);
        } catch (ex) {
          reject(ex);
        }
      }
    });
  }

  async put(name, value) {
    await this.init();

    const {
      idxDb,
      localStorageAvailable,
      DB_STORE,
      UINT8_ARRAY_MARKER
    } = this;

    if (idxDb) {
      return new Promise((resolve, reject) => {
        const request = idxDb.transaction([DB_STORE], "readwrite")
          .objectStore(DB_STORE)
          .put(value, name);
        request.onsuccess = (e) => {
          resolve(true);
        };
        request.onerror = (e) => {
          reject(e);
        }
      });
    } else if (localStorageAvailable) {
      // Uint8Array conversion to base64
      if (value instanceof Uint8Array) {
        let binary = "";
        let len = value.byteLength;
        for (let j = 0; j < len; j++) {
          binary += String.fromCharCode(value[j]);
        }
        value = UINT8_ARRAY_MARKER + btoa(binary);
      }

      localStorage.setItem(name, value);
      return true;
    }

    console.info("Unable to perform put, storage not available.")
    return false;
  }

  async get(name) {
    await this.init();

    const {
      idxDb,
      localStorageAvailable,
      DB_STORE,
      UINT8_ARRAY_MARKER
    } = this;

    if (idxDb) {
      return new Promise((resolve, reject) => {
        const request = idxDb.transaction([DB_STORE], "readwrite")
          .objectStore(DB_STORE)
          .get(name);
        request.onsuccess = (e) => {
          resolve(request.result ? request.result : null);
        };
        request.onerror = (e) => {
          reject(e);
        }
      });
    } else if (localStorageAvailable) {
      let value = localStorage.getItem(name);
      if (typeof value === 'string') {
        // base64 to Uint8Array conversion
        if (value.startsWith(UINT8_ARRAY_MARKER)) {
          const binary = atob(value.substring(UINT8_ARRAY_MARKER.length));
          const len = binary.length;
          let bytes = new Uint8Array(len);
          for (let j = 0; j < len; j++) {
              bytes[j] = binary.charCodeAt(j);
          }
          value = bytes;
        }
      }
      return value;
    }

    console.info("Unable to perform get, storage not available.")
    return null;
  }
}

export { Storage }
