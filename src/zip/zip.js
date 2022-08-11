import { zip } from './3rdparty/zip.js'

export class Zip {
  constructor() {
  }

  zipFiles(files) {
    zip.useWebWorkers = false;
    return new Promise((success, failure) => {
      zip.createWriter(
        new zip.BlobWriter('application/zip'),
        (writer) => {
          const count = files.length;
          const doIt = (index) => {
            if (index < count) {
              const f = files[index];
              writer.add(f.name, new zip.BlobReader(f.content), () => { doIt(index + 1); });
            } else {
              writer.close((blob) => {
                success(blob);
              });
            }
          }
          doIt(0);
        },
        failure);
    });
  }

  zip(blob, fileName) {
    zip.useWebWorkers = false;
    return new Promise((success, failure) => {
      const blobWriter = (zipWriter) => {
        zipWriter.add(fileName,
          new zip.BlobReader(blob), () => {
            zipWriter.close((blob) => {
              success(blob);
            })
          }
        )
      }

      zip.createWriter(
        new zip.BlobWriter('application/zip'),
        blobWriter,
        failure);
    });
  }
}
