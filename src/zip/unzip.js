import { zip } from './3rdparty/zip.js'

export class Unzip {
  static unzip(file, exts) {
    zip.useWebWorkers = false;
    return new Promise((success, failure) => {
      const entryProcessor = (entries) => {
        let romEntry = null;
        if (entries.length == 1) {
          romEntry = entries[0];
        } else if (entries.length > 0) {
          for (let i = 0; i < entries.length; i++) {
            let entry = entries[i];
            let filename = entry.filename.toLowerCase();
            for (let i = 0; i < exts.length; i++) {
              if (filename.endsWith(exts[i])) {
                romEntry = entry;
              }
            }
          }
        }
        if (romEntry) {
          let writer = new zip.BlobWriter();
          romEntry.getData(writer, success);
        } else {
          failure("Unable to find valid ROM in zip file");
        }
      }

      const blobReader = (zipReader) => {
        zipReader.getEntries(
          entryProcessor,
          failure
        );
      }

      zip.createReader(
        new zip.BlobReader(file),
        blobReader,
        (failure) => {
          console.log(`${failure}, processing as a non-zip`);
          success(file);
        }
      );
    });
  }
}
