import { zip } from './3rdparty/zip.js'

export class Zip {
  constructor() {
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
