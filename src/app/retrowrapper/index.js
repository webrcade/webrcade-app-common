import { registerAudioResume } from '../../audio/scriptprocessor';
import { AppWrapper } from '../wrapper';
import { Controller } from '../../input';
import { Controllers } from '../../input';
import { DefaultKeyCodeToControlMapping } from '../../input';
import { DisplayLoop } from '../../display/loop'
import { Resources } from '../../resources';
import { CIDS } from '../../input';
import { getScreenShot } from '../../display';
import { TEXT_IDS } from '../../resources';
import { FileManifest } from '../filemanifest';
import { NewRetroPrefs } from './newprefs';
import { BILINEAR_MODE } from './newprefs';
import ShadersService from './shaders/shaders'
import CheatsService from './cheats/cheats'
import * as LOG from '../../log'

let STATE_FILE_PATH = "/home/web_user/retroarch/userdata/states/game.state";

// sharp-bilinear.glslp
const SHARP_BILINEAR_GLSLP_PATH = '/home/web_user/retroarch/userdata/shaders/sharp-bilinear.glslp';
const SHARP_BILINEAR_GLSLP = "c2hhZGVycyA9IDEKCnNoYWRlcjAgPSBzaGFycC1iaWxpbmVhci5nbHNsCmZpbHRlcl9saW5lYXIwID0gdHJ1ZQ==";
// sharp-bilinear.glsl
const SHARP_BILINEAR_GLSL_PATH = '/home/web_user/retroarch/userdata/shaders/sharp-bilinear.glsl';
//const SHARP_BILINEAR_GLSL = "LyoKICogQUFOTi1PcHRpbWl6ZWQgKEFudGktQWxpYXNlZCBOZWFyZXN0IE5laWdoYm9yIExpdGUpCiAqIE9wdGltaXplZCBmb3IgaGVhdnkgZW11bGF0b3JzIGxpa2UgRFMgb24gbW9iaWxlIGJyb3dzZXJzLgogKi8KCiNpZiBkZWZpbmVkKFZFUlRFWCkKCiNpZiBfX1ZFUlNJT05fXyA+PSAxMzAKI2RlZmluZSBDT01QQVRfVkFSWUlORyBvdXQKI2RlZmluZSBDT01QQVRfQVRUUklCVVRFIGluCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgdmFyeWluZyAKI2RlZmluZSBDT01QQVRfQVRUUklCVVRFIGF0dHJpYnV0ZSAKI2VuZGlmCgojaWZkZWYgR0xfRVMKcHJlY2lzaW9uIGhpZ2hwIGZsb2F0OwojZW5kaWYKCkNPTVBBVF9BVFRSSUJVVEUgdmVjNCBWZXJ0ZXhDb29yZDsKQ09NUEFUX0FUVFJJQlVURSB2ZWM0IFRleENvb3JkOwpDT01QQVRfVkFSWUlORyB2ZWMyIHZUZXhDb29yZDsKCnVuaWZvcm0gbWF0NCBNVlBNYXRyaXg7CnVuaWZvcm0gdmVjMiBUZXh0dXJlU2l6ZTsKdW5pZm9ybSB2ZWMyIElucHV0U2l6ZTsKCnZvaWQgbWFpbigpCnsKICAgIGdsX1Bvc2l0aW9uID0gTVZQTWF0cml4ICogVmVydGV4Q29vcmQ7CiAgICAvLyBNYXAgdGhlIGNvb3JkaW5hdGUgc3BhY2UgY29ycmVjdGx5IGZvciB0aGUgZ2FtZSBwaXhlbHMKICAgIHZUZXhDb29yZCA9IFRleENvb3JkLnh5ICogVGV4dHVyZVNpemUueHkgLyBJbnB1dFNpemUueHk7Cn0KCiNlbGlmIGRlZmluZWQoRlJBR01FTlQpCgojaWYgX19WRVJTSU9OX18gPj0gMTMwCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgaW4KI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlCm91dCB2ZWM0IEZyYWdDb2xvcjsKI2Vsc2UKI2RlZmluZSBDT01QQVRfVkFSWUlORyB2YXJ5aW5nCiNkZWZpbmUgRnJhZ0NvbG9yIGdsX0ZyYWdDb2xvcgojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUyRAojZW5kaWYKCiNpZmRlZiBHTF9FUwpwcmVjaXNpb24gaGlnaHAgZmxvYXQ7CiNlbmRpZgoKdW5pZm9ybSB2ZWMyIE91dHB1dFNpemU7CnVuaWZvcm0gdmVjMiBUZXh0dXJlU2l6ZTsKdW5pZm9ybSB2ZWMyIElucHV0U2l6ZTsKdW5pZm9ybSBzYW1wbGVyMkQgVGV4dHVyZTsKQ09NUEFUX1ZBUllJTkcgdmVjMiB2VGV4Q29vcmQ7CgovLyBTaW1wbGlmaWVkIFBlcmNlbnQgZnVuY3Rpb24gZnJvbSB0aGUgb3JpZ2luYWwgQUFOTgovLyBUaGlzIGhhbmRsZXMgdGhlIHN1Yi1waXhlbCB3ZWlnaHRpbmcgZm9yIHRoZSBjcmlzcCBlZGdlcy4KdmVjMyBwZXJjZW50KGZsb2F0IHNzaXplLCBmbG9hdCB0c2l6ZSwgZmxvYXQgY29vcmQsIGZsb2F0IG1vZCkgewogICAgLy8gRXBzaWxvbiB0byBwcmV2ZW50IGRpdmlzaW9uIGJ5IHplcm8KICAgIGZsb2F0IHNhZmVfdHNpemUgPSBtYXgodHNpemUsIDEuMCk7CiAgICAKICAgIGZsb2F0IG1pbmZ1bGwgPSAoY29vcmQgKiBzYWZlX3RzaXplIC0gMC40OTk5OSkgLyBzYWZlX3RzaXplICogc3NpemUgKiBtb2Q7CiAgICBmbG9hdCBtYXhmdWxsID0gKGNvb3JkICogc2FmZV90c2l6ZSArIDAuNDk5OTkpIC8gc2FmZV90c2l6ZSAqIHNzaXplICogbW9kOwogICAgZmxvYXQgcmVhbGZ1bGwgPSBmbG9vcihtYXhmdWxsKSArIDAuMDAwMDE7CgogICAgcmV0dXJuIHZlYzMoCiAgICAgICAgY2xhbXAoKG1heGZ1bGwgLSByZWFsZnVsbCkgLyBtYXgobWF4ZnVsbCAtIG1pbmZ1bGwsIDAuMDAwMDEpLCAwLjAsIDEuMCksCiAgICAgICAgKHJlYWxmdWxsIC0gMC40OTk5OSkgLyBzc2l6ZSwKICAgICAgICAocmVhbGZ1bGwgKyAwLjQ5OTk5KSAvIHNzaXplCiAgICApOwp9Cgp2b2lkIG1haW4oKQp7CiAgICB2ZWMyIGdhbWVDb29yZCA9IHZUZXhDb29yZDsKCiAgICAvLyBVc2UgSW5wdXRTaXplL1RleHR1cmVTaXplIHJhdGlvIHRvIGhhbmRsZSBlbXVsYXRvciBwYWRkaW5nCiAgICB2ZWMyIG1vZF9yYXRpbyA9IElucHV0U2l6ZSAvIFRleHR1cmVTaXplOwogICAgdmVjMyB4c3R1ZmYgPSBwZXJjZW50KFRleHR1cmVTaXplLngsIE91dHB1dFNpemUueCwgZ2FtZUNvb3JkLngsIG1vZF9yYXRpby54KTsKICAgIHZlYzMgeXN0dWZmID0gcGVyY2VudChUZXh0dXJlU2l6ZS55LCBPdXRwdXRTaXplLnksIGdhbWVDb29yZC55LCBtb2RfcmF0aW8ueSk7CgogICAgLy8gU2FtcGxlIHRoZSA0IHN1cnJvdW5kaW5nIHBpeGVscyAoSGFyZHdhcmUgTGluZWFyIG11c3QgYmUgT04gaW4gbWVudSkKICAgIC8vIFdlIHNhbXBsZSBleGFjdGx5IHdoZXJlIHRoZSBwaXhlbHMgb3ZlcmxhcAogICAgdmVjMyBhID0gQ09NUEFUX1RFWFRVUkUoVGV4dHVyZSwgdmVjMih4c3R1ZmYueSwgeXN0dWZmLnkpKS5yZ2I7CiAgICB2ZWMzIGIgPSBDT01QQVRfVEVYVFVSRShUZXh0dXJlLCB2ZWMyKHhzdHVmZi56LCB5c3R1ZmYueSkpLnJnYjsKICAgIHZlYzMgYyA9IENPTVBBVF9URVhUVVJFKFRleHR1cmUsIHZlYzIoeHN0dWZmLnksIHlzdHVmZi56KSkucmdiOwogICAgdmVjMyBkID0gQ09NUEFUX1RFWFRVUkUoVGV4dHVyZSwgdmVjMih4c3R1ZmYueiwgeXN0dWZmLnopKS5yZ2I7CgogICAgLy8gU2ltcGxlIExpbmVhciBJbnRlcnBvbGF0aW9uCiAgICB2ZWMzIHgxID0gbWl4KGEsIGIsIHhzdHVmZi54KTsKICAgIHZlYzMgeDIgPSBtaXgoYywgZCwgeHN0dWZmLngpOwogICAgdmVjMyByZXN1bHQgPSBtaXgoeDEsIHgyLCB5c3R1ZmYueCk7CgogICAgRnJhZ0NvbG9yID0gdmVjNChyZXN1bHQsIDEuMCk7Cn0gCiNlbmRpZg==";
const SHARP_BILINEAR_GLSL = "LyoKICogQUFOTi1Nb2JpbGUgUHJvIChBbnRpLUFsaWFzZWQgTmVhcmVzdCBOZWlnaGJvcikKICogT3B0aW1pemVkIGZvciBoaWdoIHJlYWRhYmlsaXR5IGluIGRvd25zY2FsZWQgZ2FtZXMgKFdhcmNyYWZ0IElJKQogKiBhbmQgaGlnaCBwZXJmb3JtYW5jZSBmb3IgaGVhdnkgZW11bGF0b3JzIChOaW50ZW5kbyBEUykuCiAqLwoKI2lmIGRlZmluZWQoVkVSVEVYKQojaWYgX19WRVJTSU9OX18gPj0gMTMwCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgb3V0CiNkZWZpbmUgQ09NUEFUX0FUVFJJQlVURSBpbgojZWxzZQojZGVmaW5lIENPTVBBVF9WQVJZSU5HIHZhcnlpbmcgCiNkZWZpbmUgQ09NUEFUX0FUVFJJQlVURSBhdHRyaWJ1dGUgCiNlbmRpZgoKI2lmZGVmIEdMX0VTCnByZWNpc2lvbiBoaWdocCBmbG9hdDsKI2VuZGlmCgpDT01QQVRfQVRUUklCVVRFIHZlYzQgVmVydGV4Q29vcmQ7CkNPTVBBVF9BVFRSSUJVVEUgdmVjNCBUZXhDb29yZDsKQ09NUEFUX1ZBUllJTkcgdmVjMiB2VGV4Q29vcmQ7CnVuaWZvcm0gbWF0NCBNVlBNYXRyaXg7CnVuaWZvcm0gdmVjMiBUZXh0dXJlU2l6ZTsKdW5pZm9ybSB2ZWMyIElucHV0U2l6ZTsKCnZvaWQgbWFpbigpIHsKICAgIGdsX1Bvc2l0aW9uID0gTVZQTWF0cml4ICogVmVydGV4Q29vcmQ7CiAgICAvLyBNYXAgdGV4dHVyZSBjb29yZHMgdG8gdGhlIGdhbWUgYXJlYSwgaGFuZGxpbmcgYW55IGVtdWxhdG9yIHBhZGRpbmcKICAgIHZUZXhDb29yZCA9IFRleENvb3JkLnh5ICogVGV4dHVyZVNpemUueHkgLyBJbnB1dFNpemUueHk7Cn0KCiNlbGlmIGRlZmluZWQoRlJBR01FTlQpCiNpZiBfX1ZFUlNJT05fXyA+PSAxMzAKI2RlZmluZSBDT01QQVRfVkFSWUlORyBpbgojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUKb3V0IHZlYzQgRnJhZ0NvbG9yOwojZWxzZQojZGVmaW5lIENPTVBBVF9WQVJZSU5HIHZhcnlpbmcKI2RlZmluZSBGcmFnQ29sb3IgZ2xfRnJhZ0NvbG9yCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZTJECiNlbmRpZgoKI2lmZGVmIEdMX0VTCnByZWNpc2lvbiBoaWdocCBmbG9hdDsKI2VuZGlmCgp1bmlmb3JtIHZlYzIgVGV4dHVyZVNpemU7CnVuaWZvcm0gdmVjMiBJbnB1dFNpemU7CnVuaWZvcm0gdmVjMiBPdXRwdXRTaXplOwp1bmlmb3JtIHNhbXBsZXIyRCBUZXh0dXJlOwpDT01QQVRfVkFSWUlORyB2ZWMyIHZUZXhDb29yZDsKCi8vIFRoaXMgZnVuY3Rpb24gY2FsY3VsYXRlcyB0aGUgIkFyZWEiIHdlaWdodCBmb3IgYSBzaW5nbGUgYXhpcy4KLy8gSXQgaXMgdGhlIGNvcmUgcmVhc29uIHdoeSBXYXJjcmFmdCBJSSB0ZXh0IGJlY29tZXMgcmVhZGFibGUuCnZlYzMgZ2V0X2FyZWFfd2VpZ2h0KGZsb2F0IHNzaXplLCBmbG9hdCB0c2l6ZSwgZmxvYXQgY29vcmQpIHsKICAgIC8vIERldGVybWluZSBzY3JlZW4gcGl4ZWwgYm91bmRhcmllcyBpbiBnYW1lLXBpeGVsIHNwYWNlCiAgICBmbG9hdCBtaW5mdWxsID0gKGNvb3JkICogdHNpemUgLSAwLjUpIC8gdHNpemUgKiBzc2l6ZTsKICAgIGZsb2F0IG1heGZ1bGwgPSAoY29vcmQgKiB0c2l6ZSArIDAuNSkgLyB0c2l6ZSAqIHNzaXplOwogICAgZmxvYXQgcmVhbGZ1bGwgPSBmbG9vcihtYXhmdWxsKSArIDAuMDAwMTsKCiAgICAvLyBXZWlnaHQ6IGhvdyBtdWNoIHRoZSAncmlnaHQnIHBpeGVsIGNvbnRyaWJ1dGVzIHZzIHRoZSAnbGVmdCcKICAgIC8vIG1heCgpIHByZXZlbnRzIGRpdmlzaW9uIGJ5IHplcm8gdGhhdCBjYXVzZXMgYmxhbmsgc2NyZWVucwogICAgZmxvYXQgd2VpZ2h0ID0gY2xhbXAoKG1heGZ1bGwgLSByZWFsZnVsbCkgLyBtYXgobWF4ZnVsbCAtIG1pbmZ1bGwsIDAuMDAwMSksIDAuMCwgMS4wKTsKCiAgICByZXR1cm4gdmVjMygKICAgICAgICB3ZWlnaHQsCiAgICAgICAgKHJlYWxmdWxsIC0gMC41KSAvIHNzaXplLCAvLyBMZWZ0IHBpeGVsIHNhbXBsZSBwb2ludAogICAgICAgIChyZWFsZnVsbCArIDAuNSkgLyBzc2l6ZSAgLy8gUmlnaHQgcGl4ZWwgc2FtcGxlIHBvaW50CiAgICApOwp9Cgp2b2lkIG1haW4oKSB7CiAgICAvLyAxLiBDYWxjdWxhdGUgdGhlIHdlaWdodCBhbmQgc2FtcGxlIGNvb3JkaW5hdGVzIGZvciBib3RoIGF4ZXMKICAgIHZlYzMgeHN0dWZmID0gZ2V0X2FyZWFfd2VpZ2h0KElucHV0U2l6ZS54LCBPdXRwdXRTaXplLngsIHZUZXhDb29yZC54KTsKICAgIHZlYzMgeXN0dWZmID0gZ2V0X2FyZWFfd2VpZ2h0KElucHV0U2l6ZS55LCBPdXRwdXRTaXplLnksIHZUZXhDb29yZC55KTsKCiAgICAvLyAyLiBNYXAgYmFjayB0byB0aGUgYWN0dWFsIFRleHR1cmUgQnVmZmVyIChoYW5kbGluZyBwYWRkaW5nKQogICAgdmVjMiByYXRpbyA9IElucHV0U2l6ZSAvIFRleHR1cmVTaXplOwogICAgCiAgICAvLyAzLiBNYW51YWwgNC1UYXAgU2FtcGxpbmc6CiAgICAvLyBUaGlzIGxvb2tzIGF0IHRoZSA0IGdhbWUgcGl4ZWxzIHRoYXQgb3ZlcmxhcCB5b3VyIDEgc2NyZWVuIHBpeGVsLgogICAgdmVjMyBhID0gQ09NUEFUX1RFWFRVUkUoVGV4dHVyZSwgdmVjMih4c3R1ZmYueSwgeXN0dWZmLnkpICogcmF0aW8pLnJnYjsKICAgIHZlYzMgYiA9IENPTVBBVF9URVhUVVJFKFRleHR1cmUsIHZlYzIoeHN0dWZmLnosIHlzdHVmZi55KSAqIHJhdGlvKS5yZ2I7CiAgICB2ZWMzIGMgPSBDT01QQVRfVEVYVFVSRShUZXh0dXJlLCB2ZWMyKHhzdHVmZi55LCB5c3R1ZmYueikgKiByYXRpbykucmdiOwogICAgdmVjMyBkID0gQ09NUEFUX1RFWFRVUkUoVGV4dHVyZSwgdmVjMih4c3R1ZmYueiwgeXN0dWZmLnopICogcmF0aW8pLnJnYjsKCiAgICAvLyA0LiBCaS1saW5lYXIgaW50ZXJwb2xhdGlvbiAoTWFudWFsIE1peCkKICAgIC8vIFRoaXMgaXMgdGhlIG9wdGltaXplZCAnTGl0ZScgYmxlbmRpbmcgdGhhdCBrZWVwcyBEUyBwZXJmb3JtYW5jZSBoaWdoLgogICAgdmVjMyB4MSA9IG1peChhLCBiLCB4c3R1ZmYueCk7CiAgICB2ZWMzIHgyID0gbWl4KGMsIGQsIHhzdHVmZi54KTsKICAgIHZlYzMgcmVzdWx0ID0gbWl4KHgxLCB4MiwgeXN0dWZmLngpOwoKICAgIEZyYWdDb2xvciA9IHZlYzQocmVzdWx0LCAxLjApOwp9CiNlbmRpZg==";

export class RetroAppWrapper extends AppWrapper {
  INP_LEFT = 1;
  INP_RIGHT = 1 << 1;
  INP_UP = 1 << 2;
  INP_DOWN = 1 << 3;
  INP_START = 1 << 4;
  INP_SELECT = 1 << 5;
  INP_A = 1 << 6;
  INP_B = 1 << 7;
  INP_X = 1 << 8;
  INP_Y = 1 << 9;
  INP_LBUMP = 1 << 10;
  INP_LTRIG = 1 << 11;
  INP_LTHUMB = 1 << 12;
  INP_RBUMP = 1 << 13;
  INP_RTRIG = 1 << 14;
  INP_RTHUMB = 1 << 15;
  CONTROLLER_COUNT = 4;

  OPT1 = 1;
  OPT2 = 1 << 1;
  OPT3 = 1 << 2;
  OPT4 = 1 << 3;
  OPT5 = 1 << 4;
  OPT6 = 1 << 5;
  OPT7 = 1 << 6;
  OPT8 = 1 << 7;
  OPT9 = 1 << 8;
  OPT10 = 1 << 9;
  OPT11 = 1 << 10;
  OPT12 = 1 << 11;
  OPT13 = 1 << 12;
  OPT14 = 1 << 13;
  OPT15 = 1 << 14;
  OPT16 = 1 << 15;

  MOUSE_LEFT = 1;
  MOUSE_MIDDLE = 1 << 1;
  MOUSE_RIGHT = 1 << 2;
  MOUSE_WHEEL_UP = 1 << 3;
  MOUSE_WHEEL_DOWN = 1 << 4;
  MOUSE_HORIZ_WHEEL_UP = 1 << 5;
  MOUSE_HORIZ_WHEEL_DOWN = 1 << 6;

  constructor(app, debug = false) {
    super(app, debug);

    window.emulator = this;
    window.readyAudioContext = null;

    this.shader = null;
    this.shaders = new ShadersService(this);
    this.cheats = new CheatsService(this);
    this.prefs = new NewRetroPrefs(this);
    this.discIndex = null;
    this.romBytes = null;
    this.biosBuffers = null;
    this.escapeCount = -1;
    this.audioPlaying = false;
    this.saveStatePrefix = null;
    this.saveStatePath = null;
    this.exiting = false;
    this.mainStarted = false;
    this.disableInput = false;
    this.cheatBytes = null;
  }

  RA_DIR = '/home/web_user/retroarch/';
  RA_SYSTEM_DIR = this.RA_DIR + 'system/';

  setDisableInput(val) {
    this.disableInput = val;
  }

  getDisableInput() {
    return this.disableInput;
  }

  setDiscIndex(index) {
    this.discIndex = index;
  }

  setExiting(exiting) {
    this.exiting = true;
  }

  getScriptUrl() {
    throw "getScriptUrl() has not been implemented";
  }

  isWriteEmptyRomEnabled() {
    return false;
  }

  isDiscBased() {
    return this.app.isDiscBased();
  }

  isArchiveBased() {
    return this.app.isArchiveBased();
  }

  isMediaBased() {
    return this.app.isMediaBased();
  }

  getCustomStartHandler() {
    return null;
  }

  getExitOnLoopError() {
    return false;
  }

  setRoms(uid, frontendArray, biosBuffers, romBytes, ext) {
    console.log("#### " + uid);
    this.uid = uid;
    this.frontendArray = frontendArray;
    this.biosBuffers = biosBuffers;
    this.romBytes = romBytes;
    this.ext = ext;
    this.archiveUrl = null;
    this.media = null;
    this.filename = null;
    this.romPointer = null;
    this.romPointerLength = 0;
    this.saveDisks = 0;


    if (this.isDiscBased()) {
      const lowerExt = ext.toLowerCase();
      let outExt = "chd";
      if (lowerExt === 'pbp')
      {
         outExt = 'pbp';
      }
      else if (lowerExt === 'iso')
      {
         outExt = 'iso';
      }
      else if (lowerExt === 'cso')
      {
         outExt = 'cso';
      }
      else
      {
         /* anything else defaults to chd */
         outExt = 'chd';
      }
      this.game = this.RA_DIR + 'game.' + outExt;
    } else {
      this.game = this.RA_DIR + "game.bin";
    }

    this.game = this.isDiscBased() ?
      (this.RA_DIR + 'game.' + (ext != null && ext === 'pbp' ? 'pbp' : 'chd')) :
      (this.RA_DIR + "game.bin");
  }

  async setShader(shaderId) {
  }

  getShadersService() {
    return this.shaders;
  }

  getCheatsService() {
    return this.cheats;
  }

  isOneShotCheats() {
    return false;
  }

  setRomPointer(ptr) {
    this.romPointer = ptr;
  }

  getRomPointer() {
    return this.romPointer ? this.romPointer : 0;
  }

  setRomPointerLength(len) {
    this.romPointerLength = len;
  }

  getRomPointerLength() {
    return this.romPointerLength ? this.romPointerLength : 0;
  }

  setFilename(name) {
    this.filename = name;
  }

  setArchiveUrl(url) {
    this.archiveUrl = url;
  }

  setMedia(media) {
    this.media = media;
  }

  setSaveDisks(count) {
    this.saveDisks = count;
  }

  createControllers() {
    return new Controllers([
      new Controller(new DefaultKeyCodeToControlMapping()),
      new Controller(),
      new Controller(),
      new Controller(),
    ]);
  }

  createAudioProcessor() {
    return null;
  }

  async onShowPauseMenu() {
    await this.saveState();
  }

  getControllerIndex(index) {
    return index;
  }

  onArchiveFile(isDir, name, stats) {}

  onArchiveFilesFinished() {}

  getArchiveBinaryFileName() {
    return "";
  }

  isEscapeHackEnabled() {
    return true;
  }

  handleEscape(controllers) {}

  pollControls() {
    const { analogMode, CONTROLLER_COUNT, controllers } = this;

    controllers.poll();

    const isAnalog = analogMode;

    if (
      controllers.isControlDown(0, CIDS.RTRIG) ||
      controllers.isControlDown(0, CIDS.LTRIG) ||
      controllers.isControlDown(0, CIDS.LANALOG) ||
      controllers.isControlDown(0, CIDS.RANALOG)
    ) {
      this.escapeCount = this.escapeCount === -1 ? 0 : this.escapeCount + 1;
    } else {
      this.escapeCount = -1;
    }

    for (let i = 0; i < CONTROLLER_COUNT; i++) {
      let input = 0;

      const escapeOk = !this.isEscapeHackEnabled() || (this.escapeCount === -1 || this.escapeCount < 60);

      // Hack to reduce likelihood of accidentally bringing up menu
      if (
        controllers.isControlDown(0 /*i*/, CIDS.ESCAPE) && escapeOk
      ) {
        if (this.handleEscape(controllers)) {
            return;
        } else if (this.pause(true)) {
          controllers
            .waitUntilControlReleased(0 /*i*/, CIDS.ESCAPE)
            .then(() => this.showPauseMenu());
          return;
        }
      }

      if (controllers.isControlDown(i, CIDS.UP, !isAnalog)) {
        input |= this.INP_UP;
      } else if (controllers.isControlDown(i, CIDS.DOWN, !isAnalog)) {
        input |= this.INP_DOWN;
      }
      if (controllers.isControlDown(i, CIDS.RIGHT, !isAnalog)) {
        input |= this.INP_RIGHT;
      } else if (controllers.isControlDown(i, CIDS.LEFT, !isAnalog)) {
        input |= this.INP_LEFT;
      }
      if (controllers.isControlDown(i, CIDS.START) && escapeOk) {
        input |= this.INP_START;
      }
      if (controllers.isControlDown(i, CIDS.SELECT) && escapeOk) {
        input |= this.INP_SELECT;
      }
      if (controllers.isControlDown(i, CIDS.A)) {
        input |= this.INP_A;
      }
      if (controllers.isControlDown(i, CIDS.B)) {
        input |= this.INP_B;
      }
      if (controllers.isControlDown(i, CIDS.X)) {
        input |= this.INP_X;
      }
      if (controllers.isControlDown(i, CIDS.Y)) {
        input |= this.INP_Y;
      }
      if (controllers.isControlDown(i, CIDS.LBUMP)) {
        input |= this.INP_LBUMP;
      }
      if (controllers.isControlDown(i, CIDS.RBUMP)) {
        input |= this.INP_RBUMP;
      }
      if (controllers.isControlDown(i, CIDS.LTRIG)) {
        input |= this.INP_LTRIG;
      }
      if (controllers.isControlDown(i, CIDS.RTRIG)) {
        input |= this.INP_RTRIG;
      }
      if (controllers.isControlDown(i, CIDS.LANALOG)) {
        input |= this.INP_LTHUMB;
      }
      if (controllers.isControlDown(i, CIDS.RANALOG)) {
        input |= this.INP_RTHUMB;
      }

      const analog0x = controllers.getAxisValue(i, 0, true);
      const analog0y = controllers.getAxisValue(i, 0, false);
      const analog1x = controllers.getAxisValue(i, 1, true);
      const analog1y = controllers.getAxisValue(i, 1, false);

      let controller = this.getControllerIndex(i);
      this.sendInput(
        controller,
        input,
        analog0x,
        analog0y,
        analog1x,
        analog1y,
      );
    }
  }

  sendInput(controller, input, analog0x, analog0y, analog1x, analog1y) {
    if (!this.getDisableInput()) {
      window.Module._wrc_set_input(
        controller,
        input,
        analog0x,
        analog0y,
        analog1x,
        analog1y,
      );
    } else {
      window.Module._wrc_set_input(
        controller, 0, 0, 0, 0, 0
      );
    }
  }

  updateSaveStateForSlotProps(slot, props) {}

  loadEmscriptenModule(canvas) {
    const { app, frontendArray, RA_DIR } = this;

    const scriptUrl = this.getScriptUrl();

    return new Promise((resolve, reject) => {
      window.Module = {
        canvas: canvas,
        noInitialRun: true,
        print: function(text) {
            console.log(text);
        },
        // Redirect stderr (fprintf) to console.log to stop the red error spam
        printErr: function(text) {
            //console.log(text);
            // Optional: If you still want to see real errors in red, you could do:
            if (text.toLowerCase().includes('error')) console.error(text); else console.log(text);
        },
        onAbort: (msg) => app.exit(msg),
        onExit: () => app.exit(),
        onRuntimeInitialized: () => {
          const f = () => {
            // Enable show message
            this.setShowMessageEnabled(true);
            if (window.readyAudioContext) {
              if (window.readyAudioContext.state !== 'running') {
                app.setShowOverlay(true);
                registerAudioResume(
                  window.readyAudioContext,
                  (running) => {
                    if (running) {
                      window.Module._rwebaudio_enable();
                      window.Module._cmd_audio_reinit();
                      this.audioPlaying = true;
                    }
                    setTimeout(() => app.setShowOverlay(!running), 50);
                  },
                  500,
                );
              } else {
                window.Module._rwebaudio_enable();
                window.Module._cmd_audio_reinit();
                this.audioPlaying = true;
              }
            } else {
              setTimeout(f, 1000);
            }
          };
          setTimeout(f, 1000);
          resolve();
        },
// PPSSSPP: Add this?
        // preRun: function() {
        //   // FORCE the stencil buffer. PPSSPP will not boot without it.
        //   Module.webglContextAttributes = {
        //       alpha: false,
        //       depth: true,
        //       stencil: true, // <--- CRITICAL
        //       antialias: false,
        //       preserveDrawingBuffer: false,
        //       powerPreference: "high-performance",
        //       majorVersion: 2 // Prefer WebGL 2
        //   };
        // },
        preInit: function () {
          const FS = window.FS;
          FS.mkdir('/home/web_user/retroarch');
          FS.mkdir('/home/web_user/retroarch/system');
          FS.mkdir('/home/web_user/retroarch/userdata');
          FS.mkdir('/home/web_user/retroarch/userdata/system');
          FS.mkdir('/home/web_user/retroarch/userdata/system/neocd');
          FS.mkdir('/home/web_user/retroarch/userdata/system/vice');
          // FS.mkdir('/home/web_user/retroarch/userdata/system/same_cdi');
          // FS.mkdir('/home/web_user/retroarch/userdata/system/same_cdi/bios');
          FS.mkdir('/home/web_user/retroarch/userdata/saves');
          FS.mkdir('/home/web_user/retroarch/userdata/saves/opera');
          FS.mkdir('/home/web_user/retroarch/userdata/saves/opera/per_game');
          FS.mkdir('/home/web_user/retroarch/userdata/states');
          FS.mkdir('/home/web_user/retroarch/userdata/shaders');

          // Write out the sharp bilinear
          const base64ToUint8Array = (b64) => {
            const bin = atob(b64);
            return Uint8Array.from(bin, c => c.charCodeAt(0));
          }

          FS.writeFile(
            SHARP_BILINEAR_GLSLP_PATH,
            base64ToUint8Array(SHARP_BILINEAR_GLSLP)
          );

          FS.writeFile(
            SHARP_BILINEAR_GLSL_PATH,
            base64ToUint8Array(SHARP_BILINEAR_GLSL)
          );

          window.emulator.preInit(FS);
        },
      };

      const script = document.createElement('script');
      document.body.appendChild(script);
      script.src = scriptUrl;
    });
  }

  async getStateSlots(showStatus = true) {
    return await this.getSaveManager().getStateSlots(
      this.saveStatePrefix, showStatus ? this.saveMessageCallback : null
    );
  }

  preInit(fs) {}

  getShotAspectRatio() { return null; }
  getShotRotation() { return null; }

  async saveStateForSlot(slot) {
    const { Module } = window;

    let shot = null;
    let oldShaderId = null;
    try {
      let shaderId = this.shaders.getShaderId();
      if (shaderId !== this.shaders.DISABLED) {
        oldShaderId = shaderId;
        this.shaders.setShader(this.shaders.DISABLED, false)
      } else {
        console.log("Shader is disabled, ignoring shot swap.");
      }
      shot = await getScreenShot(this.canvas,
        () => {
          Module._cmd_audio_stop();
          Module._emscripten_mainloop();
          Module._cmd_audio_start();
        }, 10)
    } finally {
      if (oldShaderId) {
        this.shaders.setShader(oldShaderId, false)
      }
    }

    Module._cmd_save_state();

    let s = null;
    try {
      const FS = window.FS;
      try {
        s = FS.readFile(STATE_FILE_PATH);
      } catch (e) { }

      if (s) {

        const props = {}

        const ar = this.getShotAspectRatio();
        if (ar) {
          props.aspectRatio = `${ar}`;
        }
        const rot = this.getShotRotation();
        if (rot) {
          props.transform = `rotate(${rot}deg)`;
        }

        const otherProps = {}
        this.updateSaveStateForSlotProps(slot, otherProps);

        await this.getSaveManager().saveState(
          this.saveStatePrefix, slot, s,
          shot ? null : this.canvas,
          this.saveMessageCallback,
          shot,
          props,
          otherProps);
      }
    } catch (e) {
      LOG.error('Error saving state: ' + e);
    }

    return true;
  }

  async loadStateForSlot(slot) {
    const { Module } = window;

    try {
      const state = await this.getSaveManager().loadState(
        this.saveStatePrefix, slot, this.saveMessageCallback);

      if (state) {
        const FS = window.FS;
        FS.writeFile(STATE_FILE_PATH, state);
        Module._cmd_load_state();
      }
    } catch (e) {
      LOG.error('Error loading state: ' + e);
    }
    return true;
  }

  async deleteStateForSlot(slot, showStatus = true) {
    try {
      await this.getSaveManager().deleteState(
        this.saveStatePrefix, slot, showStatus ? this.saveMessageCallback : null);
    } catch (e) {
      LOG.error('Error deleting state: ' + e);
    }
    return true;
  }

  onPause(p) {
    if (!p) {
      if (window.readyAudioContext) {
        window.readyAudioContext.resume();
        console.log(window.readyAudioContext);
        window.Module._rwebaudio_enable();
        window.Module._cmd_audio_reinit();
      }
    }
  }

  async applyGameSettings() {}

  getBilinearModeSupported() {
    return true;
  }

  updateBilinearFilter() {
// PPSSPP: Disable or errors
    if (!this.mainStarted) return;

    const shaderSelected = this.shaders.isShaderSelected();

    if (shaderSelected) {
      window.Module._wrc_enable_bilinear_filter(0);
      return;
    }

    const bilinearMode = this.prefs.getBilinearMode();
    if (bilinearMode === BILINEAR_MODE.BL_OFF) {
      this.shaders.untrackedUnloadShader();
      window.Module._wrc_enable_bilinear_filter(0);
    } else if (bilinearMode === BILINEAR_MODE.BL_SOFT) {
      this.shaders.untrackedUnloadShader();
      window.Module._wrc_enable_bilinear_filter(1);
    } else {
      this.shaders.untrackedLoadShaderByPath(SHARP_BILINEAR_GLSLP_PATH);
    }
  }

  isForceAspectRatio() {
    return this.getScreenSize() === this.SS_NATIVE;
  }

  updateScreenSize() {
// PPSSPP: Disable or errors
    if (!this.mainStarted) return;

    try {
      const enabled = this.isForceAspectRatio();
      window.Module._wrc_force_aspect_ratio(enabled ? 1 : 0);
    } catch (e) {
      LOG.info("Unable to invoke _wrc_force_aspect_ratio.");
    }

    super.updateScreenSize();
  }

  resizeScreen(canvas) {
    throw "resizeScreen() has not been implemented."
  }

  createDisplayLoop(debug) {
    const loop = new DisplayLoop(
      60, // frame rate (ignored due to no wait)
      true, // vsync
      debug, // debug
      false, // force native
      false, // no wait
    );
    //loop.setAdjustTimestampEnabled(false);
    return loop;
  }

  setExitErrorMessage(message) {
    this.exitErrorMessage = message;
  }

  setCheatBytes(bytes) {
    this.cheatBytes = bytes || null;
  }

  onCheatsLoadStart(count) {
    this.cheats.onCheatsLoadStart(count);
  }

  onCheatAdded(idx, desc, enabled, code) {
    this.cheats.onCheatAdded(idx, desc, enabled, code);
  }

  onCheatsLoadEnd() {
    this.cheats.onCheatsLoadEnd();
  }

  onFrame() {}

  async onWriteAdditionalFiles() {
    const { FS } = window;
    if (this.cheatBytes) {
      try {
        const cheatsDir = '/home/web_user/retroarch/userdata/cheats';
        try { FS.mkdir(cheatsDir); } catch (e) {}
        FS.writeFile(`${cheatsDir}/game.cht`, this.cheatBytes);
        LOG.info(`[Cheats]: Wrote cheat file to ${cheatsDir}/game.cht`);
        const text = new TextDecoder().decode(this.cheatBytes);
        LOG.info(`[Cheats]: File contents:\n${text}`);
      } catch (e) {
        LOG.error(`[Cheats]: Error writing cheat file: ${e}`);
      }
    }
  }

  setStateFilePath(path) {
    STATE_FILE_PATH = path;
  }

  getRaConfigContents() {
    return null;
  }

  isDirectFileSupportedForArchives() {
    return false;
  }

  async onStoreMedia() {}

  getDisplayLoopReturn() { return undefined; }

  async onStart(canvas) {
    const { app, debug, game } = this;
    const { FS, Module } = window;

    try {
      this.canvas = canvas;

      if (this.isDiscBased()) {
        setTimeout(() => {
          app.setState({ loadingMessage: null, loadingPercent: null });
          setTimeout(() => {
            app.setState({ loadingMessage: 'Starting' });
          }, 2000);
        }, 2000);
      } else {
        app.setState({ loadingMessage: null, loadingPercent: null });
      }

      if (this.romBytes && this.romBytes.byteLength === 0) {
        throw new Error('The size is invalid (0 bytes).');
      }

      // // Load preferences
      // await this.prefs.load();
      await this.cheats.preloadSaved();
      await this.onWriteAdditionalFiles();

      // Apply the game settings
      await this.applyGameSettings();

      // Copy BIOS files
      for (let bios in this.biosBuffers) {
        const bytes = this.biosBuffers[bios];
        const path = '/home/web_user/retroarch/userdata/system/' + bios;

//console.log("Writing bios file: " + path);
        FS.writeFile(path, bytes);
      }

      // Prepare game content
      if (this.isArchiveBased()) {
        try {
          if (this.romBytes.length > 10 * 1024 * 1024) {
            app.setState({ loadingMessage: 'Preparing files' });
            await this.wait(10);
          }

          // Extract the archive
          await this.extractArchive(
            window.FS, "/content", this.romBytes, this.DEFAULT_MAX_EXTRACT_SIZE, this
          );

          app.setState({ loadingMessage: null });
          await this.wait(10);
        } catch (e) {
          let manifest = null;
          try {
            LOG.info("Not a zip file, checking for a manifest.");
            FS.mkdir("/content");
            manifest = new FileManifest(this, FS, "/content", this.romBytes, this.archiveUrl, this);
            const totalSize = await manifest.process();
            if (!totalSize) throw e;
          } catch (e) {
            if (manifest && !manifest.getParsed()) {
              if (this.isDirectFileSupportedForArchives() && this.filename) {
                LOG.info("Not a manifest, just use file directly");
                const fullPath = "/content/" + this.filename;
                const pathIndex = fullPath.lastIndexOf("/");
                if (pathIndex !== -1) {
                  this.createDirectories(FS, fullPath.substring(0, pathIndex));
                }
                let stream = FS.open(fullPath, 'a');
                FS.write(stream, this.romBytes, 0, this.romBytes.length, 0, true);
                FS.close(stream);
              } else {
                throw e;
              }
            } else {
              throw e;
            }
          }
        }
      } else if (this.isMediaBased()) {
        await this.onStoreMedia();
      } else {
        // Write rom file
        let stream = FS.open(game, 'a');
        if (!this.isWriteEmptyRomEnabled()) {
          FS.write(stream, this.romBytes, 0, this.romBytes.length, 0, true);
        }
        FS.close(stream);
      }
      this.romBytes = null;

      if (this.isDiscBased()) {
        await this.wait(2000);
      }

      // Load the save state
      this.saveStatePrefix = app.getStoragePath(`${this.uid}/`);
      this.saveStatePath = `${this.saveStatePrefix}${this.SAVE_NAME}`;
      await this.loadState();

      if (this.isDiscBased()) {
        await this.wait(10000);
      }

      const customStart = this.getCustomStartHandler();
      if (customStart) {
        await customStart(this);
      } else {
        window.readyAudioContext = new window.AudioContext();
        window.readyAudioContext.resume();
        console.log(window.readyAudioContext);

        // # Audio settings
        // audio_driver = "sdl" # or "openal", "xaudio2", etc.
        // audio_sample_rate = "44100" # or "48000"
        // audio_latency = "256" # Increasing this can help reduce popping
        // audio_buffer_size = "512" # Adjust as necessary

        // # Frame throttle settings
        // frame_throttle = "true"
        // run_ahead = "0" # Disable run-ahead to help with audio issues

        // # Video settings
        // video_sync = "true" # Enable V-Sync to help with frame/audio sync
        // threaded_video = "true" # Improves performance on multi-core CPUs

        // # Enable audio sync settings
        // audio_sync = "false" # You may want to disable this if you're having issues

        try {
          const name = this.isArchiveBased() ? this.getArchiveBinaryFileName() : this.game;
          const raConfigContents = this.getRaConfigContents();
          if (raConfigContents) {
            LOG.info("RA Config:");
            LOG.info(raConfigContents);
            window.FS.writeFile(
              "/home/web_user/retroarch/userdata/retroarch.cfg",
              raConfigContents
            );
          }

          Module.callMain(['-v', name]);
        } catch (e) {
          LOG.error(e);
        }

        // Mark that main has been started
        this.mainStarted = true;

        // Bilinear filter
        const bilinearMode = this.prefs.getBilinearMode();
        if (bilinearMode !== BILINEAR_MODE.BL_OFF) {
          // TODO: Figure out a way to do this without re-init of video
          await this.wait(1000);
          this.updateBilinearFilter();
        }

        // Apply shader value
        await this.getShadersService().setShader(this.getPrefs().getShaderId());

        if (this.isDiscBased()) {
          setTimeout(() => {
            app.setState({ loadingMessage: null });
          }, 50);
        }

        this.displayLoop = await this.createDisplayLoop(debug);

        setTimeout(() => {
          this.resizeScreen(canvas);
          Module.setCanvasSize(canvas.offsetWidth, canvas.offsetHeight);
          setTimeout(() => {
            this.resizeScreen(canvas);
          }, 1);
        }, 50);

        window.onresize = () => {
          Module.setCanvasSize(canvas.offsetWidth, canvas.offsetHeight);
          setTimeout(() => {
            this.resizeScreen(canvas);
          }, 1);
        };

        let exit = false;
        let s = false;

        // Start the display loop
        this.displayLoop.start(() => {
          try {
            if (!exit) {
              this.pollControls();
              Module._emscripten_mainloop();
              this.onFrame();
            }
          } catch (e) {
            console.log(e)
            if (e.status === 1971) {
              // Menu was displayed, should never happen (bad rom?
              if (!this.exiting) {
                app.exit(this.exitErrorMessage ? this.exitErrorMessage : Resources.getText(TEXT_IDS.ERROR_UNKNOWN));
              } else {
                app.exit();
              }
              exit = true;
            } else {
              if (this.getExitOnLoopError()) {
                app.exit(Resources.getText(TEXT_IDS.ERROR_UNKNOWN));
                exit = true;
              }
              LOG.error(e);
            }
          }

          if (!s) {
            s = true;
            app.setState({loadingMessage: null, loadingPercent: null});
          }

          return this.getDisplayLoopReturn();
        });
      }
    } catch (e) {
      window.readyAudioContext = null;
      app.setState({loadingMessage: null, loadingPercent: null});
      LOG.error(e);
      app.exit(e);
    }
  }
}
