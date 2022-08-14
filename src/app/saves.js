import { dropbox } from '../storage/cloud/dropbox'
import { settings } from '../settings/settings'
import { storage } from '../storage/storage'
import { Resources, TEXT_IDS } from '../resources'
import { Unzip, Zip } from '../zip'
import * as LOG from '../log'

class SaveManager {
  constructor(wrapper, errorCallback) {
    this.appWrapper = wrapper;
    this.cloudEnabled = null;
    this.errorCallback = errorCallback;
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
    const INFO_NAME = "info.txt";

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
      content:  new Blob([JSON.stringify({
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
          alert('delete: ' + zipPath);
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
}

export { SaveManager }
