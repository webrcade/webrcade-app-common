import React, { Fragment } from "react";

import { blobToStr } from '../../../../util';
import { md5 } from '../../../../util';
import { removeEmptyArrayItems } from '../../../../util';
import { setMessageAnchorId } from '../../message';
import { settings } from '../../../../settings';
import { DiscSelectionEditor } from '../../../screens/selectdisc'
import { FetchAppData } from '../../../../app';
import { Resources } from '../../../../resources';
import { UrlUtil } from '../../../../util';
import { WebrcadeApp } from '..';
import { AppRegistry } from "../../../../apps";
import { romNameScorer } from "../../../../zip";
import { Unzip } from "../../../../zip";
import * as LOG  from '../../../../log';
import { TEXT_IDS } from '../../../../resources';

export class WebrcadeRetroApp extends WebrcadeApp {
  emulator = null;

  MODE_DISC_SELECT = 'discSelectionMode';

  constructor() {
    super();

    this.state.mode = null;
  }

  createEmulator(app, isDebug) {
    throw "createEmulator is not implemented.";
  }

  isDiscBased() {
    return true;
  }

  isArchiveBased() {
    return false;
  }

  isMediaBased() {
    return false;
  }

  isBiosRequired() {
    return true;
  }

  getBiosMap() {
    return null;
  }

  getAlternateBiosMap() {
    return null;
  }

  getBiosUrls() {
    return null;
  }

  async fetchMedia(media) {
    const ret = [];
    if (media) {
      for (let i = 0; i < media.length; i++) {
        const mediaUrl = media[i];
        if (mediaUrl.trim().length === 0) {
          continue;
        }
        const fad = new FetchAppData(mediaUrl);
        const res = await fad.fetch();
        if (res.ok) {
          let blob = await res.blob();
          const uz = new Unzip().setDebug(this.isDebug());
          blob = await uz.unzip(blob, this.extsNotUnique, this.exts, romNameScorer);
          let filename = uz.getName();
          if (!filename) {
            filename = fad.getFilename(res);
          }
          if (!filename) {
            filename = UrlUtil.getFileName(mediaUrl);
          }
          const bytes = new Uint8Array(await blob.arrayBuffer());
          ret.push([bytes, filename])
        }
      }
    }
    return ret;
  }

  async fetchBios(bios, biosMap = null, alternateBiosMap = null) {
    let biosBuffers = {};

    const BIOS_MAP = biosMap ? biosMap : this.getBiosMap();
    const ALT_BIOS_MAP = alternateBiosMap ? alternateBiosMap : this.getAlternateBiosMap();

    for (let i = 0; i < bios.length; i++) {
      const biosUrl = bios[i];
      if (biosUrl.trim().length === 0) {
        continue;
      }

      const fad = new FetchAppData(biosUrl);
      const res = await fad.fetch();
      const blob = await res.blob();
      const blobStr = await blobToStr(blob);
      const md5Hash = md5(blobStr);
      let name = BIOS_MAP[md5Hash];
      if (ALT_BIOS_MAP && !name) {
        name = ALT_BIOS_MAP[md5Hash];
      }
      if (name) {
        biosBuffers[name] = new Uint8Array(await blob.arrayBuffer());
      }
    }

    if (Object.keys(BIOS_MAP).length > 0) {
      let haveBuffers = false;
      if (ALT_BIOS_MAP) {
        for (let p in ALT_BIOS_MAP) {
          const f = ALT_BIOS_MAP[p];
          for (let n in biosBuffers) {
            if (f === n) {
              const buff = biosBuffers[n];
              biosBuffers = {};
              biosBuffers[n] = buff;
              haveBuffers = true;
              break;
            }
          }
        }
      }

      if (!haveBuffers) {
        for (let p in BIOS_MAP) {
          const f = BIOS_MAP[p];
          let found = false;
          for (let n in biosBuffers) {
            if (f === n) {
              found = true;
              break;
            }
          }
          if (!found) throw new Error(`Unable to find BIOS file: ${f}`);
        }
      }
    }

    console.log(biosBuffers);

    return biosBuffers;
  }

  getExtension(url, fad, res) {
    let filename = fad.getFilename(res);
    if (!filename) {
      filename = UrlUtil.getFileName(url);
    }
    if (filename) {
      const comps = filename.split('.');
      if (comps.length > 1) {
        return comps[comps.length - 1].toLowerCase();
      }
    }
    return null;
  }

  start(discIndex) {
    setMessageAnchorId('canvas');

    const { appProps, bios, discs, media, emulator, ModeEnum } = this;

    this.setState({ mode: ModeEnum.LOADING });

    try {
      let biosBuffers = null;
      let frontend = null;
      let extension = null;

      let fad = null;
      let discUrl = null;

      let exts = null;
      let extsNotUnique = null;

      const type = appProps.type;

      exts = AppRegistry.instance.getExtensions(
        type, true, false
      );
      this.exts = exts;
      extsNotUnique = AppRegistry.instance.getExtensions(
        type, true, true
      );
      this.extsNotUnique = extsNotUnique;

      if (this.isDiscBased()) {
        discUrl = discs[discIndex];
        fad = new FetchAppData(discUrl);
      } else if (this.isArchiveBased()) {
        fad = new FetchAppData(this.archive);
      } else if  (this.isMediaBased()) {
        fad = null;
      } else {
        fad = new FetchAppData(this.rom);
      }

      // Load Emscripten and ROM binaries
      settings
        .load()
        .then(() => emulator.loadEmscriptenModule(this.canvas))
        .then(() => { return this.isBiosRequired() ? this.fetchBios(bios) : null; })
        .then((b) => { biosBuffers = b; })
        .then(() => fad ? fad.fetch() : null)
        .then((response) => {
          if (this.isDiscBased()) {
            extension = this.getExtension(discUrl, fad, response);
            emulator.setDiscIndex(discIndex);
          }
          return response;
        })
        .then((response) => {
          if (this.isDiscBased() || this.isArchiveBased()) {
            return this.fetchResponseBuffer(response)
          } else if (this.isMediaBased()) {
            return this.fetchMedia(this.media)
          } else {
            let romBlob = null;
            const uz = new Unzip().setDebug(this.isDebug());
            return response.blob()
              .then((blob) => uz.unzip(blob, extsNotUnique, exts, romNameScorer))
              .then((blob) => {
                romBlob = blob;
                return blob;
              })
              .then((blob) => AppRegistry.instance.getMd5(blob, type))
              .then((md5) => { this.uid = md5; })
              .then(() => new Response(romBlob).arrayBuffer())
              .then((buffer) => new Uint8Array(buffer))
          }
        })
        .then((content) => {
          emulator.setRoms(this.uid, frontend, biosBuffers,
            this.isMediaBased() ? null : content,
            extension
          );
          if (this.isArchiveBased()) {
            emulator.setArchiveUrl(this.archive);
          }
          if (this.isMediaBased()) {
            emulator.setMedia(content);
            emulator.setSaveDisks(this.saveDisks);
          }
          return content;
        })
        .then(() =>
          this.setState({
            mode: ModeEnum.LOADED,
            loadingMessage: null,
          }),
        )
        .catch((msg) => {
          LOG.error(msg);
          this.exit(
            msg ? msg : Resources.getText(TEXT_IDS.ERROR_RETRIEVING_GAME),
          );
        });
    } catch (e) {
      this.exit(e);
    }
  }

  componentDidMount() {
    super.componentDidMount();

    const { appProps } = this;

    // Create the emulator
    if (this.emulator === null) {
      try {
        this.emulator = this.createEmulator(this, this.isDebug());

        if (this.isDiscBased() || this.isArchiveBased() || this.isMediaBased()) {
          // Get the uid
          this.uid = appProps.uid;
          if (!this.uid)
            throw new Error('A unique identifier was not found for the game.');

          if (this.isDiscBased()) {
            // Get the discs location that was specified
            this.discs = appProps.discs;
            if (this.discs) this.discs = removeEmptyArrayItems(this.discs);
            if (!this.discs || this.discs.length === 0)
              throw new Error('A disc was not specified.');
          } else if (this.isMediaBased()) {
            // Get the media that was specified
            this.media = appProps.media;
            this.saveDisks = appProps.saveDisks;
            if (this.media) this.media = removeEmptyArrayItems(this.media);
            if ((!this.media || this.media.length === 0) && (!this.saveDisks || this.saveDisks <= 0))
              throw new Error('No media was specified.');
          } else {
            this.archive = appProps.archive;
            if (!this.archive)
              throw new Error('An archive file was not specified.');
          }
        } else {
          // Get the ROM location that was specified
          const rom = appProps.rom;
          if (!rom) throw new Error('A ROM file was not specified.');
          this.rom = rom;
        }

        this.bios = this.getBiosUrls(appProps);
        if (this.bios && !Array.isArray(this.bios)) {
          this.bios = [this.bios];
        }

        if (this.bios) this.bios = removeEmptyArrayItems(this.bios);
        if (this.isBiosRequired() &&
            (Object.keys(this.getBiosMap()).length > 0) &&
            (!this.bios || this.bios.length === 0)) {
          throw new Error('BIOS file(s) were not specified.');
        }

        if (this.isDiscBased() && this.discs.length > 1) {
          this.setState({ mode: this.MODE_DISC_SELECT });
        } else {
          this.start(0);
        }
      } catch (msg) {
        LOG.error(msg);
        this.exit(
          msg ? msg : Resources.getText(TEXT_IDS.ERROR_RETRIEVING_GAME),
        );
      }
    }
  }

  async onPreExit() {
    try {
      await super.onPreExit();
      if (!this.isExitFromPause()) {
        await this.emulator.saveState();
      }
    } catch (e) {
      LOG.error(e);
    }
  }

  componentDidUpdate() {
    const { mode } = this.state;
    const { ModeEnum, emulator, canvas } = this;

    if (mode === ModeEnum.LOADED) {
      window.focus();
      // Start the emulator
      emulator.start(canvas);
    }
  }

  renderPauseScreen() {
    throw "renderPauseScreen not implemented";
  }

  renderCanvas() {
    return (
      <canvas
        ref={(canvas) => {
          this.canvas = canvas;
        }}
        id="canvas"
      ></canvas>
    );
  }

  render() {
    const { errorMessage, loadingMessage, statusMessage, mode } = this.state;
    const { ModeEnum, MODE_DISC_SELECT } = this;

    return (
      <Fragment>
        {super.render()}
        {mode === MODE_DISC_SELECT && this.discs ? (
          <DiscSelectionEditor app={this} />
        ) : null}
        {!statusMessage && (mode === ModeEnum.LOADING || (loadingMessage && !errorMessage))
          ? this.renderLoading()
          : null}
        {mode === ModeEnum.PAUSE ? this.renderPauseScreen() : null}
        {this.renderCanvas()}
      </Fragment>
    );
  }
}

export default App;
