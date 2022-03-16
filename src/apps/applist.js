import { UrlUtil, isDev, isEmptyString } from '../util';
import { config } from '../conf';
import * as Genesis from './type/genesis';
import * as Atari7800 from './type/7800';
import * as Lynx from './type/lynx';
import * as Nes from './type/nes';

let n64Str = ((typeof window !== "undefined") ? UrlUtil.getParam(window.location.search, "n64") : null);
if (n64Str) {
  n64Str = n64Str.toLowerCase();
}
const n64enabled = n64Str && (n64Str === "1" || n64Str === "true");

const localIp = config.getLocalIp();
const locGenesis = isDev() ? `http://${localIp}:3010` : 'app/genesis';
const locSms = locGenesis;

const loc7800 = isDev() ? `http://${localIp}:3020` : 'app/7800';
const locNes = isDev() ? `http://${localIp}:3030` : 'app/nes';
const locDoom = isDev() ? `http://${localIp}:3040` : 'app/doom';
const loc2600 = isDev() ? `http://${localIp}:3050` : 'app/2600';
const locSnes = isDev() ? `http://${localIp}:3060` : 'app/snes';
const locN64 = isDev() ? `http://${localIp}:3065` : 'app/n64';
const locGba = isDev() ? `http://${localIp}:3070` : 'app/gba';
const locNeo = isDev() ? `http://${localIp}:3077` : 'app/neo';
const locMednafen = isDev() ? `http://${localIp}:3075` : 'app/mednafen';

const checkRom = app => {
  if (app.props === undefined || isEmptyString(app.props.rom)) {
    throw new Error("Missing 'rom' property");
  }
}

let APP_TYPE_KEYS = Object.freeze({
  // Types
  FBNEO_NEOGEO: "fbneo-neogeo",
  FCEUX: "fceux",
  GENPLUSGX_GG: "genplusgx-gg",
  GENPLUSGX_MD: "genplusgx-md",
  GENPLUSGX_SG: "genplusgx-sg",
  GENPLUSGX_SMS: "genplusgx-sms",
  JAVATARI: "javatari",
  JS7800: "js7800",
  MEDNAFEN_LNX: "mednafen-lnx",
  MEDNAFEN_NGC: "mednafen-ngc",
  MEDNAFEN_NGP: "mednafen-ngp",
  MEDNAFEN_PCE: "mednafen-pce",
  MEDNAFEN_SGX: "mednafen-sgx",
  MEDNAFEN_VB: "mednafen-vb",
  MEDNAFEN_WSC: "mednafen-wsc",
  MEDNAFEN_WS: "mednafen-ws",
  PRBOOM: "prboom",
  SNES9X: "snes9x",
  VBA_M_GBA: "vba-m-gba",
  VBA_M_GB: "vba-m-gb",
  VBA_M_GBC: "vba-m-gbc",
  // Aliases
  A2600: "2600",
  A7800: "7800",
  DOOM: "doom",
  GBA: "gba",
  GB: "gb",
  GBC: "gbc",
  GENESIS: "genesis",
  GG: "gg",
  LNX: "lnx",
  NEOGEO: "neogeo",
  NES: "nes",
  NGC: "ngc",
  NGP: "ngp",
  PCE: "pce",
  SG1000: 'sg1000',
  SGX: 'sgx',
  SMS: "sms",
  SNES: "snes",
  VB: "vb",
  WSC: "wsc",
  WS: "ws"
});

if (n64enabled) {
  APP_TYPE_KEYS =  Object.freeze({
    ...{
      PARALLEL_N64: "parallel-n64",
      N64: "n64",
    },
    ...APP_TYPE_KEYS
  })
}

const PCE_DEFAULTS = {
  rom: "",
  pad6button: false
};

const WS_DEFAULTS = {
  rom: "",
  rotated: false,
  language: 0
}

const NGP_DEFAULTS = {
  rom: "",
  language: 0
}

let types = [
  {
    key: APP_TYPE_KEYS.SNES9X,
    name: 'Super Nintendo',
    shortName: 'Nintendo SNES',
    coreName: 'SNES9X',
    location: locSnes,
    thumbnail: "images/app/snes-thumb.png",
    background: "images/app/snes-background.png",
    validate: checkRom,
    extensions: ['smc', 'sfc', 'swc'],
    defaults: {
      rom: "",
      pal: false,
      port2: 0
    }
  },
  {
    key: APP_TYPE_KEYS.JAVATARI,
    name: 'Atari 2600',
    coreName: 'Javatari',
    location: loc2600,
    thumbnail: "images/app/2600-thumb.png",
    background: "images/app/2600-background.png",
    validate: checkRom,
    extensions: ['a26'],
    defaults: {
      rom: "",
      swap: false
    }
  }, {
    key: APP_TYPE_KEYS.JS7800,
    name: 'Atari 7800',
    coreName: 'JS7800',
    location: loc7800,
    background: 'images/app/7800-background.png',
    thumbnail: 'images/app/7800-thumb.png',
    validate: checkRom,
    extensions: ['a78'],
    testMagic: Atari7800.testMagic,
    getMd5: Atari7800.getMd5,
    defaults: {
      rom: ""
    }
  }, {
    key: APP_TYPE_KEYS.GENPLUSGX_MD,
    name: 'Sega Genesis',
    coreName: 'Genesis Plus GX',
    location: locGenesis,
    background: 'images/app/genesis-background.png',
    thumbnail: 'images/app/genesis-thumb.png',
    validate: checkRom,
    extensions: ['smd', 'md', 'gen'],
    testMagic: Genesis.testMagic,
    defaults: {
      rom: "",
      pal: false,
      pad3button: false
    }
  }, {
    key: APP_TYPE_KEYS.FCEUX,
    name: 'Nintendo Entertainment System',
    shortName: 'Nintendo NES',
    coreName: 'FCEUX',
    location: locNes,
    background: 'images/app/nes-background.png',
    thumbnail: 'images/app/nes-thumb.png',
    validate: checkRom,
    extensions: ['nes'],
    testMagic: Nes.testMagic,
    getMd5: Nes.getMd5,
    defaults: {
      rom: "",
      pal: false
    }
  }, {
    key: APP_TYPE_KEYS.GENPLUSGX_SMS,
    name: 'Sega Master System',
    coreName: 'Genesis Plus GX',
    location: locSms,
    background: 'images/app/mastersystem-background.png',
    thumbnail: 'images/app/mastersystem-thumb.png',
    validate: checkRom,
    extensions: ['sms'],
    defaults: {
      rom: "",
      hwType: 0,
      pal: false,
      ym2413: false
    }
  }, {
    key: APP_TYPE_KEYS.GENPLUSGX_SG,
    name: 'Sega SG-1000',
    coreName: 'Genesis Plus GX',
    location: locSms,
    background: 'images/app/sg1000-background.png',
    thumbnail: 'images/app/sg1000-thumb.png',
    validate: checkRom,
    extensions: ['sg'],
    defaults: {
      rom: "",
      pal: false
    }
  }, {
    key: APP_TYPE_KEYS.GENPLUSGX_GG,
    name: 'Sega Game Gear',
    coreName: 'Genesis Plus GX',
    location: locSms,
    background: 'images/app/gamegear-background.png',
    thumbnail: 'images/app/gamegear-thumb.png',
    validate: checkRom,
    extensions: ['gg'],
    defaults: {
      rom: ""
    }
  }, {
    key: APP_TYPE_KEYS.VBA_M_GBA,
    name: 'Nintendo Game Boy Advance',
    shortName: 'Nintendo GBA',
    coreName: 'VBA-M',
    location: locGba,
    background: 'images/app/gba-background.png',
    thumbnail: 'images/app/gba-thumb.png',
    validate: checkRom,
    extensions: ['gba'],
    defaults: {
      rom: "",
      rotation: 0,
      rtc: false,
      mirroring: false,
      saveType: 0,
      flashSize: 65536
    }
  }, {
    key: APP_TYPE_KEYS.VBA_M_GB,
    name: 'Nintendo Game Boy',
    shortName: 'Nintendo Game Boy',
    coreName: 'VBA-M',
    location: locGba,
    background: 'images/app/gb-background.png',
    thumbnail: 'images/app/gb-thumb.png',
    validate: checkRom,
    extensions: ['gb'],
    defaults: {
      rom: "",
      hwType: 0,
      colors: 0,
      palette: 0,
      border: 0
    }
  }, {
    key: APP_TYPE_KEYS.VBA_M_GBC,
    name: 'Nintendo Game Boy Color',
    shortName: 'Nintendo Game Boy Color',
    coreName: 'VBA-M',
    location: locGba,
    background: 'images/app/gbc-background.png',
    thumbnail: 'images/app/gbc-thumb.png',
    validate: checkRom,
    extensions: ['gbc'],
    defaults: {
      rom: ""
    }
  }, {
    key: APP_TYPE_KEYS.MEDNAFEN_PCE,
    name: 'NEC PC Engine',
    shortName: 'NEC PC Engine',
    coreName: 'Mednafen',
    location: locMednafen,
    background: 'images/app/pce-background.png',
    thumbnail: 'images/app/pce-thumb.png',
    validate: checkRom,
    extensions: ['pce'],
    defaults: PCE_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.MEDNAFEN_SGX,
    name: 'NEC SuperGrafx',
    shortName: 'NEC SuperGrafx',
    coreName: 'Mednafen',
    location: locMednafen,
    background: 'images/app/sgx-background.png',
    thumbnail: 'images/app/sgx-thumb.png',
    validate: checkRom,
    extensions: ['sgx'],
    defaults: PCE_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.MEDNAFEN_VB,
    name: 'Nintendo Virtual Boy',
    shortName: 'Nintendo Virtual Boy',
    coreName: 'Mednafen',
    location: locMednafen,
    background: 'images/app/vb-background.png',
    thumbnail: 'images/app/vb-thumb.png',
    validate: checkRom,
    extensions: ['vb'], // TODO: More?
    defaults: {
      rom: "",
      pad6button: false
    }
  }, {
    key: APP_TYPE_KEYS.MEDNAFEN_NGC,
    name: 'SNK Neo Geo Pocket Color',
    shortName: 'SNK Neo Geo Pocket Color',
    coreName: 'Mednafen',
    location: locMednafen,
    background: 'images/app/ngc-background.png',
    thumbnail: 'images/app/ngc-thumb.png',
    validate: checkRom,
    extensions: ['ngc'],
    defaults: NGP_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.MEDNAFEN_NGP,
    name: 'SNK Neo Geo Pocket',
    shortName: 'SNK Neo Geo Pocket',
    coreName: 'Mednafen',
    location: locMednafen,
    background: 'images/app/ngp-background.png',
    thumbnail: 'images/app/ngp-thumb.png',
    validate: checkRom,
    extensions: ['ngp'],
    defaults: NGP_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.MEDNAFEN_WSC,
    name: 'Bandai WonderSwan Color',
    shortName: 'Bandai WonderSwan Color',
    coreName: 'Mednafen',
    location: locMednafen,
    background: 'images/app/wsc-background.png',
    thumbnail: 'images/app/wsc-thumb.png',
    validate: checkRom,
    extensions: ['wsc'],
    defaults: WS_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.MEDNAFEN_WS,
    name: 'Bandai WonderSwan',
    shortName: 'Bandai WonderSwan',
    coreName: 'Mednafen',
    location: locMednafen,
    background: 'images/app/ws-background.png',
    thumbnail: 'images/app/ws-thumb.png',
    validate: checkRom,
    extensions: ['ws'],
    defaults: WS_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.MEDNAFEN_LNX,
    name: 'Atari Lynx',
    shortName: 'Atari Lynx',
    coreName: 'Mednafen',
    location: locMednafen,
    background: 'images/app/lynx-background.png',
    thumbnail: 'images/app/lynx-thumb.png',
    validate: checkRom,
    extensions: ['lnx'],
    testMagic: Lynx.testMagic,
    getMd5: Lynx.getMd5,
    addProps: (feedProps, outProps) => {
      const boot = feedProps.lnx_boot;
      if (boot) {
        outProps.lnx_boot = boot;
      }
    },
    defaults: {
      rom: "",
      rotation: 0
    }
  }, {
    key: APP_TYPE_KEYS.FBNEO_NEOGEO,
    name: 'SNK Neo Geo',
    shortName: 'SNK Neo Geo',
    coreName: 'Final Burn Neo',
    location: locNeo,
    background: 'images/app/neogeo-background.png',
    thumbnail: 'images/app/neogeo-thumb.png',
    validate: checkRom,
    extensions: [],
    addProps: (feedProps, outProps) => {
      const bios = feedProps.neogeo_bios;
      if (bios) {
        outProps.neogeo_bios = bios;
      }
    },
    defaults: {
      rom: "",
      parentRom: ""
    }
  }
];

const addAlias = (types, alias, typeKey) => {
  const { key, ...props } = types.filter(t => t.key === typeKey)[0];
  types.push({ key: alias, absoluteKey: typeKey, ...props });
}

// N64
if (n64enabled) {
  types.push({
    key: APP_TYPE_KEYS.PARALLEL_N64,
    name: 'Nintendo 64',
    coreName: 'paraLLEl N64',
    location: locN64,
    background: 'images/app/n64-background.png',
    thumbnail: 'images/app/n64-thumb.png',
    validate: checkRom,
    extensions: ['n64', 'v64', 'z64'],
    isDelayedExit: true,
    addParams: (url) => {
      url = UrlUtil.addParam(url, "n64", "1");
      const N64_SKIP_RP = "n64.skip";
      const n64skip = UrlUtil.getParam(
        window.location.search, N64_SKIP_RP);
      if (n64skip) {
        url = UrlUtil.addParam(url, N64_SKIP_RP, n64skip) ;
      }
      const N64_VBO_RP = "n64.vbo";
      const n64vbo = UrlUtil.getParam(
        window.location.search, N64_VBO_RP);
      if (n64vbo) {
        url = UrlUtil.addParam(url, N64_VBO_RP, n64vbo);
      }
      return url;
    },
    defaults: {
      rom: ""
    }
  });
  addAlias(types, APP_TYPE_KEYS.N64, APP_TYPE_KEYS.PARALLEL_N64);
}

// Only add PRBoom on public server
if (config.isPublicServer()) {
  types.push({
    key: APP_TYPE_KEYS.PRBOOM,
    name: 'Doom Classic',
    coreName: 'PrBoom',
    location: locDoom,
    background: 'images/app/doom-background.png',
    thumbnail: 'images/app/doom-thumb.png',
    isDelayedExit: true,
    validate: app => {
      if (app.props === undefined || isEmptyString(app.props.game)) {
        throw new Error("Missing 'game' property");
      }
    },
    defaults: {
      game: ""
    }
  });
  addAlias(types, APP_TYPE_KEYS.DOOM, APP_TYPE_KEYS.PRBOOM);
}

// Aliases
addAlias(types, APP_TYPE_KEYS.A2600, APP_TYPE_KEYS.JAVATARI);
addAlias(types, APP_TYPE_KEYS.A7800, APP_TYPE_KEYS.JS7800);
addAlias(types, APP_TYPE_KEYS.GBA, APP_TYPE_KEYS.VBA_M_GBA);
addAlias(types, APP_TYPE_KEYS.GB, APP_TYPE_KEYS.VBA_M_GB);
addAlias(types, APP_TYPE_KEYS.GBC, APP_TYPE_KEYS.VBA_M_GBC);
addAlias(types, APP_TYPE_KEYS.GENESIS, APP_TYPE_KEYS.GENPLUSGX_MD);
addAlias(types, APP_TYPE_KEYS.GG, APP_TYPE_KEYS.GENPLUSGX_GG);
addAlias(types, APP_TYPE_KEYS.LNX, APP_TYPE_KEYS.MEDNAFEN_LNX);
addAlias(types, APP_TYPE_KEYS.NEOGEO, APP_TYPE_KEYS.FBNEO_NEOGEO);
addAlias(types, APP_TYPE_KEYS.NES, APP_TYPE_KEYS.FCEUX);
addAlias(types, APP_TYPE_KEYS.NGC, APP_TYPE_KEYS.MEDNAFEN_NGC);
addAlias(types, APP_TYPE_KEYS.NGP, APP_TYPE_KEYS.MEDNAFEN_NGP);
addAlias(types, APP_TYPE_KEYS.PCE, APP_TYPE_KEYS.MEDNAFEN_PCE);
addAlias(types, APP_TYPE_KEYS.SG1000, APP_TYPE_KEYS.GENPLUSGX_SG);
addAlias(types, APP_TYPE_KEYS.SGX, APP_TYPE_KEYS.MEDNAFEN_SGX);
addAlias(types, APP_TYPE_KEYS.SMS, APP_TYPE_KEYS.GENPLUSGX_SMS);
addAlias(types, APP_TYPE_KEYS.SNES, APP_TYPE_KEYS.SNES9X);
addAlias(types, APP_TYPE_KEYS.VB, APP_TYPE_KEYS.MEDNAFEN_VB);
addAlias(types, APP_TYPE_KEYS.WSC, APP_TYPE_KEYS.MEDNAFEN_WSC);
addAlias(types, APP_TYPE_KEYS.WS, APP_TYPE_KEYS.MEDNAFEN_WS);

const APP_TYPES = types;

export { APP_TYPE_KEYS, APP_TYPES };
