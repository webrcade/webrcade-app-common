import * as LOG from '../log';
import { FetchAppData } from './fetch';

class FileManifest {
    constructor(emulator, FS, destination, bytes, url, archiveCallback) {
        this.archiveCallback = archiveCallback;
        this.emulator = emulator;
        this.app = emulator.getApp();
        this.FS = FS;
        this.destination = destination;
        this.bytes = bytes;
        const lastIndex = url.lastIndexOf("/");
        this.url = url.substring(0, lastIndex);;
    }

    onArchiveFile(isDir, name, stats) {
      if (this.archiveCallback) {
        this.archiveCallback.onArchiveFile(isDir, name, stats);
      }
    }

    onArchiveFilesFinished() { }

    getUrl(name, url) {
      let path = this.url;
      let slash = 0;
      if (path.endsWith('/')) slash++;
      if (!url || url.trim().length === 0) {
        url = name;
      } else {
        if (url.toLowerCase().startsWith("http")) {
          return url;
        }
      }

      if (path.startsWith('/')) slash++;

      return  (
        slash === 0 ? path + "/" + url :
          slash === 1 ? path + url :
            path.substring(1) + url
      )
    }

    getDestinationFile(name) {
      let path = this.destination;
      let slash = 0;
      if (path.endsWith('/')) slash++;
      if (name.startsWith('/')) slash++;

      return  (
        slash === 0 ? path + "/" + name :
          slash === 1 ? path + name :
            path.substring(1) + name
      )
    }

    async walkFiles() {
      const { manifest, FS, app } = this;

      let size = 0;
      let method = null;

      const files = [];
      for (let i = 0; i < manifest.files.length; i++) {
        const file = manifest.files[i];
        if (file.extract) {
          files.push(file)
        }
      }
      for (let i = 0; i < manifest.files.length; i++) {
        const file = manifest.files[i];
        if (!file.extract) {
          files.push(file)
        }
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let requestUrl = this.getUrl(file.name, file.url ? file.url : "")
        const destinationFile = this.getDestinationFile(file.name);
        const extract = file.extract;

        const dirs = destinationFile.split("/");
        let path = "";
        for (let i = 0; i < dirs.length -1; i++) {
          const dir = dirs[i];
          if (dir === "") {
            continue;
          }
          path += ("/" + dir);
          if (!FS.analyzePath(path).exists) {
            FS.mkdir(path);
          }
        }

        if (files.length > 1) {
          app.setState({ loadingMessage: `Loading ${i + 1} of ${files.length}`,  loadingPercent: null });
        } else {
          app.setState({ loadingMessage: "Loading",  loadingPercent: null });
        }
        await this.emulator.wait(10);

        requestUrl = requestUrl.replaceAll("#", "%23");
        LOG.info(requestUrl);

        const fad = new FetchAppData(requestUrl);
        fad.setMethod(method);
        const res = await fad.fetch();
        const bytes = await app.fetchResponseBuffer(res);
        method = fad.getSuccessMethod();

        size += bytes.length;

        console.log(destinationFile);

        await this.emulator.wait(10);

        if (extract) {
          console.log("#### extract")
          console.log(destinationFile);
          const lastIndex = destinationFile.lastIndexOf("/");
          const destinationDir = destinationFile.substring(0, lastIndex);
          console.log(destinationDir);
          await this.emulator.extractArchive(
            FS, destinationDir, bytes, 10 * 1024 * 1024 * 1024, this
          );
        } else {
          // Write file
          let stream = FS.open(destinationFile, 'a');
          FS.write(stream, bytes, 0, bytes.length, 0, true);
          FS.close(stream);

          if (this.archiveCallback) {
            this.archiveCallback.onArchiveFile(false, destinationFile, null /*TODO*/)
          }
        }
      }

      if (this.archiveCallback) {
        this.archiveCallback.onArchiveFilesFinished();
      }

      return size;
    }

    async process() {
      if (!(this.bytes.length < 10 * 1024 * 1024)) { // 10mb max
        return false;
      }

      let parsed = false;
      try {
        const contents = new TextDecoder().decode(this.bytes);
        this.manifest = JSON.parse(contents);
        if (!this.manifest.files) {
          throw new Error("Unable to find files in manifest.");
        }
        parsed = true;
        const size = await this.walkFiles();

        return size;
      } catch (e) {
        LOG.error(e);
        if (parsed) throw e;
      }

      return null;
    }
}

export { FileManifest };
