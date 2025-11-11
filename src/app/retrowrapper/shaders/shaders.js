
import * as LOG from '../../../log'
import { resolvePath } from '../../../util';
import { FetchAppData } from '../../fetch';

import SHADERS from './shaders.json'

const DISABLED = "disabled";

export default class ShadersService {
  constructor(emulator) {
    this.shaderId = DISABLED;
    this.emulator = emulator;
    this.downloaded = false;
    this.DISABLED = DISABLED;
  }

  getShaders() {
    return SHADERS;
  }

  getShaderId() {
    return this.shaderId;
  }

  getShaderById(shaderId) {
    for (const category of SHADERS.categories) {
      const shader = category.shaders.find(shader => shader.id === shaderId);
      if (shader) return shader;
    }
    return null;
  }

  getShaderCategoryId(shaderId) {
    for (const category of SHADERS.categories) {
      if (category.shaders.some(shader => shader.id === shaderId)) {
        return category.id;
      }
    }
    return DISABLED;
  }

  async downloadShaders() {
    const { FS } = window;

    if (!this.downloaded) {
      try {
        const path = resolvePath("shaders.zip");
        const fad = new FetchAppData(path);
        const res = await fad.fetch();
        const bytes = await this.emulator.getApp().fetchResponseBuffer(res);
        await this.emulator.extractArchive(FS, "/home/web_user/retroarch/userdata/shaders",
          bytes, 128 * 1024 * 1024, null, true);
        this.downloaded = true;
      } catch (e) {
        this.emulator.showErrorMessage("An error occurred while downloading shaders.")
        LOG.error(e);
      }
    }
  }

  async setShader(shaderId, updatePrefs = true) {
    await this.loadShader(shaderId);
    if (updatePrefs) {
      this.emulator.getPrefs().setShaderId(shaderId);
      await this.emulator.getPrefs().save();
    }
  }

  async loadShader(shaderId) {
    const { Module } = window;

    if (!shaderId || shaderId === "") return;

    if (shaderId === this.shaderId) return;

    await this.downloadShaders();

    const shader = this.getShaderById(shaderId)
    let path = "";
    if (shader && shader.id !== DISABLED) {
      path = "/home/web_user/retroarch/userdata/shaders/" + shader.file;
    }

    const setShaderFromJS = Module.cwrap('wrc_set_shader', 'void', ['string']);
    setShaderFromJS(path);

    this.shaderId = shaderId;
  }

  addEditorValues(values) {
    const shaderId = this.getShaderId();
    const shaderCategoryId = this.getShaderCategoryId(shaderId);
    values.shaderCategoryId = shaderCategoryId;
    values.shaderId = shaderId;
  }
}
