import { dropbox } from '../storage/cloud/dropbox'
import { settings } from '../settings/settings'
import { storage } from '../storage/storage'
import { Resources, TEXT_IDS } from '../resources'
import { Unzip, Zip } from '../zip'
import { blobToStr, md5 } from '../util'
import * as LOG from '../log'

const INFO_NAME = "info.txt";
const STATE_NAME = "state";
const STATE_SLOTS = 8;

class SaveManager {
  constructor(wrapper, errorCallback) {
    this.appWrapper = wrapper;
    this.cloudEnabled = null;
    this.errorCallback = errorCallback;
    this.lastHashes = {};
    this.gameSavesDisabled = false;
  }

  _compareHashes(a, b) {
    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }
    for (let key in a) {
      const vala = a[key];
      const valb = b[key];
      if (vala !== valb) {
        // console.log(key + ": " + vala + " != " + valb);
        return false;
      }
    }
    return true;
  }

  async checkFilesChanged(files) {
    const hashes = {}
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const name = f.name;

      if (name === INFO_NAME) {
        continue;
      }

      let blob = f.content;
      if (!(blob instanceof Blob)) {
        blob = new Blob([blob]);
      }
      const hash = md5(await blobToStr(blob));
      hashes[name] = hash;
    }

    if (!this._compareHashes(hashes, this.lastHashes)) {
      this.lastHashes = hashes;
      return true;
    }
    return false;
  }

  async isCloudEnabled(callback) {
    if (this.cloudEnabled === null) {
      this.cloudEnabled = false;
      if (settings.isCloudStorageEnabled()) {
        if (callback) callback(Resources.getText(TEXT_IDS.CLOUD_CHECKING));
        this.cloudEnabled = await dropbox.testWrite();
        if (!this.cloudEnabled && this.errorCallback) {
          this.errorCallback(
            Resources.getText(TEXT_IDS.CLOUD_SAVES_DISABLED)
          )
        }
      }
    }
    return this.cloudEnabled;
  }

  async createZip(files) {
    const zip = new Zip();
    const zipFiles = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      let b = f.content;
      if (!(b instanceof Blob)) {
        b = new Blob([b]);
      }
      if (f.name !== INFO_NAME) {
        zipFiles.push({
          name: f.name,
          content: b
        });
      }
    }

    zipFiles.push({
      name: INFO_NAME,
      content: new Blob([JSON.stringify({
        title: this.appWrapper.getTitle(),
        time: new Date().getTime()
      })])
    });

    return await zip.zipFiles(zipFiles);
  }

  async getFiles(blob) {
    if (!(blob instanceof Blob)) {
      blob = new Blob([b]);
    }

    const unzip = new Unzip();
    const files = await unzip.unzipFiles(blob);
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      f.content = new Uint8Array(await f.content.arrayBuffer());
    }
    return files;
  }

  getZipFileName(path) {
    return path.endsWith(".zip") ? path : `${path}.zip`;
  }

  async load(path, callback) {
    if (this.gameSavesDisabled) {
      LOG.info("Game-based saves are disabled (state was loaded).");
      return null;
    }

    try {
      if (await this.isCloudEnabled(callback)) {
        try {
          if (callback) callback(Resources.getText(TEXT_IDS.CLOUD_CHECKING /*TEXT_IDS.CLOUD_LOAD*/));
          return await this.loadCloud(path);
        } catch (e) {
          LOG.error(`Error loading save from cloud: ${e}`);
        }

        // Unable to find in the cloud, look locally
        LOG.info("Did not find save in the cloud, looking locally.");
        const files = await this.loadLocal(path);
        if (files) {
          LOG.info("Found locally.");

          // Found locally, move to cloud
          await this.save(path, files, callback);

          return files;
        }
        return null;
      } else {
        return await this.loadLocal(path);
      }
    } finally {
      if (callback) callback(null);
    }
  }

  async save(path, files, callback) {
    if (this.gameSavesDisabled) {
      LOG.info("Game-based saves are disabled (state was loaded).");
      return;
    }

    try {
      if (await this.isCloudEnabled(callback)) {
        try {
          if (callback) callback(Resources.getText(TEXT_IDS.CLOUD_SAVE));
          const success = await this.saveCloud(path, files);
          if (success) {
            if (storage.remove(this.getZipFileName(path))) {
              LOG.info("Successfully saved to the cloud, deleting local files.");
            }
          }
        } catch (e) {
          LOG.error(`Error persisting save to cloud: ${e}`);
        }
        return false;
      } else {
        return await this.saveLocal(path, files);
      }
    } finally {
      if (callback) callback(null);
    }
  }

  async delete(path, callback) {
    try {
      const zipPath = this.getZipFileName(path)
      if (await this.isCloudEnabled(callback)) {
        try {
          if (callback) callback(Resources.getText(TEXT_IDS.CLOUD_SAVE));
          return await dropbox.deleteFile(zipPath);
        } catch (e) {
          LOG.error(`Error deleting save from cloud: ${e}`);
        }
        return false;
      } else {
        return await storage.remove(zipPath);
      }
    } finally {
      if (callback) callback(null);
    }
  }

  async getStateSlots(pathPrefix, callback) {
    const slots = new Array(STATE_SLOTS + 1);
    try {
      if (await this.isCloudEnabled(callback)) {
        if (callback) callback(Resources.getText(TEXT_IDS.CLOUD_CHECKING));

        for (let i = 1; i <= STATE_SLOTS; i++) {
          const path = `${pathPrefix}state.${i}.json`;
          try {
            const json = await this.loadCloudSingleFile(path);
            slots[i] = JSON.parse(await json.text())
          } catch (e) {
            LOG.error(`Error getting save slot info, ${path}: ${e}`);
          }
        }
        return slots;
      }
    } finally {
      if (callback) callback(null);
    }
  }

  async saveState(pathPrefix, slot, state, canvas, callback, shot) {
    try {
      const path = `${pathPrefix}state.${slot}`;
      const pathMeta = `${path}.json`;
      const files = [
        {
          name: STATE_NAME,
          content: state,
        },
      ];

      if (await this.isCloudEnabled(callback)) {
        try {
          if (callback) callback(Resources.getText(TEXT_IDS.CLOUD_SAVE));

          this.deleteState(pathPrefix, slot, null);

          await this.saveCloud(path, files);
          await this.saveCloudSingleFile(pathMeta, JSON.stringify({
            time: new Date().getTime(),
            shot: shot ? shot :
              canvas ? canvas.toDataURL() : null
          }));
        } catch (e) {
          LOG.error(`Error persisting state to cloud: ${e}`);
          if (this.errorCallback) {
            this.errorCallback(Resources.getText(TEXT_IDS.CLOUD_SAVE_STATE_ERROR))
          }
        }
      }
    } finally {
      if (callback) callback(null);
    }
  }

  async loadState(pathPrefix, slot, callback) {
    try {
      const path = `${pathPrefix}state.${slot}`;

      if (await this.isCloudEnabled(callback)) {
        try {
          if (callback) callback(Resources.getText(TEXT_IDS.CLOUD_LOAD));
          const files = await this.loadCloud(path);
          for (var i = 0; i < files.length; i++) {
            const f = files[i];
            if (f.name == STATE_NAME) {
              if (!this.gameSavesDisabled) {
                this.gameSavesDisabled = true;
                LOG.info("Save state was loaded, game-based saves are disabled.");
              }
              return f.content;
            }
          }
        } catch (e) {
          LOG.error(`Error loading save state from cloud: ${e}`);
          if (this.errorCallback) {
            this.errorCallback(Resources.getText(TEXT_IDS.CLOUD_LOAD_STATE_ERROR))
          }
        }
        return null;
      }
    } finally {
      if (callback) callback(null);
    }
  }

  async deleteState(pathPrefix, slot, callback) {
    try {
      const path = `${pathPrefix}state.${slot}`;
      const pathMeta = `${path}.json`;

      if (await this.isCloudEnabled(callback)) {
        if (callback) callback(Resources.getText(TEXT_IDS.CLOUD_DELETING));

        try {
          await this.delete(path, null);
        } catch (e) {}

        try {
          await this.deleteCloudSingleFile(pathMeta);
        } catch (e) {}
      }
    } finally {
      if (callback) callback(null);
    }
  }

  async loadLocal(path) {
    LOG.info(`Loading save locally: ${path}`);
    const zipPath = this.getZipFileName(path);
    const zip = await storage.get(zipPath);
    return zip ? await this.getFiles(zip) : null;
  }

  async saveLocal(path, files) {
    LOG.info(`Saving save locally: ${path}`);
    const zip = await this.createZip(files);
    const zipPath = this.getZipFileName(path)
    await storage.put(zipPath, zip);
  }

  async loadCloud(path) {
    LOG.info(`Loading save from cloud: ${path}`);
    const zipPath = this.getZipFileName(path);
    const zip = await dropbox.downloadFile(zipPath);
    return await this.getFiles(zip);
  }

  async saveCloud(path, files) {
    LOG.info(`Saving save to cloud: ${path}`);
    const zip = await this.createZip(files);
    const zipPath = this.getZipFileName(path);
    try {
      return await dropbox.uploadFile(zip, zipPath);
    } catch(e) {
      if (this.errorCallback) {
        this.errorCallback(Resources.getText(TEXT_IDS.CLOUD_SAVE_ERROR))
      }
      throw e;
    }
  }

  async saveCloudSingleFile(path, content) {
    LOG.info(`Saving to cloud: ${path}`);
    try {
      return await dropbox.uploadFile(content, path);
    } catch(e) {
      if (this.errorCallback) {
        this.errorCallback(Resources.getText(TEXT_IDS.CLOUD_SAVE_ERROR))
      }
      throw e;
    }
  }

  async loadCloudSingleFile(path) {
    LOG.info(`Loading from cloud: ${path}`);
    return await dropbox.downloadFile(path);
  }

  async deleteCloudSingleFile(path) {
    LOG.info(`Deleting from cloud: ${path}`);
    try {
      await dropbox.deleteFile(path);
    } catch(e) {
      if (this.errorCallback) {
        this.errorCallback(Resources.getText(TEXT_IDS.CLOUD_SAVE_ERROR))
      }
      throw e;
    }
  }
}

export { SaveManager, STATE_SLOTS }
