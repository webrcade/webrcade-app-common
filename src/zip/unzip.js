import * as LOG from '../log'
import { zip } from './3rdparty/zip.js'

export class Unzip {
  constructor() {
    this.name = null;
    this.debug = false;
  }

  setDebug(debug) {
    this.debug = debug;
    return this;
  }

  getName() {
    return this.name;
  }

  unzip(file, exts, prefExts, scorer) {
    zip.useWebWorkers = false;
    const that = this;
    return new Promise((success, failure) => {
      const entryProcessor = (entries) => {
        let romEntry = null;
        let prefRomEntry = null;
        if (entries.length == 1) {
          romEntry = entries[0];
        } else if (entries.length > 0) {
          const scores = {};

          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const filename = entry.filename.toLowerCase();
            // Walk through extensions, only add to scores if
            // file name has appropriate extension
            for (let i = 0; i < exts.length; i++) {
              if (filename.endsWith(exts[i])) {
                scores[entry.filename] = {
                  entry: entry,
                  lower: filename,
                  score: 0
                }

                // Check for preferred extensions, if it has a preferred extension,
                // add 1000 points
                if (prefExts !== undefined) {
                  for (let i = 0; i < prefExts.length; i++) {
                    if (filename.endsWith(prefExts[i])) {
                      if (this.debug) {
                        LOG.info('Known ext, +1000: ' + entry.filename);
                      }
                      scores[entry.filename].score += 1000; // +1000 for known extension
                    }
                  }
                }
                break;
              }
            }
          }

          if (scorer) scorer(scores, this.debug);
          if (this.debug) {
            LOG.info(scores);
          }

          let maxScore = -1;
          for(const fname in scores) {
            const score = scores[fname];
            if (score.score > maxScore) {
              if (this.debug) {
                LOG.info('New max: ' + score.entry.filename);
              }
              romEntry = score.entry;
              maxScore = score.score;
            }
          }
        }

        if (romEntry) {
          that.name = romEntry.filename;
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
          LOG.info(`${failure}, processing as a non-zip`);
          success(file);
        }
      );
    });
  }
}

export const romNameScorer = (scores, debug) => {
  const codes = {
    "[!]": {
      points: 100,
      isRegion: false
    },
    "(u)": {
      points: 50,
      isRegion: true
    },
    "(usa)": {
      points: 50,
      isRegion: true
    },
    "(ue)": {
      points: 45,
      isRegion: true
    },
    "(eu)": {
      points: 45,
      isRegion: true
    },
    "(uj)": {
      points: 45,
      isRegion: true
    },
    "(ju)": {
      points: 45,
      isRegion: true
    },
    "(e)": {
      points: 40,
      isRegion: true
    },
    "(j)": {
      points: 30,
      isRegion: true
    }
  }

  const regions = {};

  for(const fname in scores) {
    const score = scores[fname];
    for (const cname in codes) {
      const code = codes[cname];
      if (score.lower.indexOf(cname) != -1) {
        if (debug) {
          LOG.info('Adding ' + code.points +" to " + score.entry.filename);
        }
        score.score += code.points;

        if (code.isRegion) {
          let fnameList = regions[cname];
          if (!fnameList) {
            fnameList = [];
            regions[cname] = fnameList;
          }
          fnameList.push(score);
        }
      }
    }
  }

  if (debug) {
    LOG.info(regions);
  }
  // Walk regions and add a point for shortest length file name
  for (const rname in regions) {
    const rscores = regions[rname];
    let minLength = 99999;
    let minScore = null;
    for (let i = 0; i < rscores.length; i++) {
      const score = rscores[i];
      if (score.lower.length < minLength) {
        minLength = score.lower.length;
        minScore = score;
      }
    }
    if (minScore) {
      minScore.score += 1; // Add one to score as it has the shortest length
    }
  }
}
