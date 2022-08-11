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

  async isCloudEnabled() {
    if (this.cloudEnabled === null) {
      this.cloudEnabled = false;
      if (settings.isCloudStorageEnabled()) {
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
      zipFiles.push({
        name: f.name,
        content: b
      });
    }

    zipFiles.push({
      name: "info",
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
    if (await this.isCloudEnabled()) {
      try {
        if (callback) callback(Resources.getText(TEXT_IDS.CLOUD_LOAD));
        return await this.loadCloud(path);
      } catch (e) {
        LOG.error(`Error loading save from cloud: ${e}`);
      } finally {
        if (callback) callback(null);
      }

      // Unable to find in the cloud, look locally
      LOG.info("Did not find save in the cloud, looking locally.");
      const files = await this.loadLocal(path);
      if (files) {
        LOG.info("Found locally.");
        return files;
      }
      return null;
    } else {
      return await this.loadLocal(path);
    }
  }

  async save(path, files, callback) {
    if (await this.isCloudEnabled()) {
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
      } finally {
        if (callback) callback(null);
      }
      return false;
    } else {
      return await this.saveLocal(path, files);
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
