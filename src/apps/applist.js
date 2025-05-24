import { UrlUtil, isDev, isEmptyString } from '../util';
import { config } from '../conf';
import * as Genesis from './type/genesis';
import * as Atari7800 from './type/7800';
import * as Lynx from './type/lynx';
import * as Nes from './type/nes';
import * as Coleco from './type/coleco';

// Whether to enable Atari 5200
const enable5200 = false;

// const http = "https://";
const http = "http://";

//const localIp = "192.168.1.157"; // config.getLocalIp();
const localIp = config.getLocalIp();
const locGenesis = isDev() ? `${http}${localIp}:3010` : 'app/genesis/';
const locSms = locGenesis;
const locRetroGenesis = isDev() ? `${http}${localIp}:3101` : 'app/retro-genesis/';
const locRetroPceFast = isDev() ? `${http}${localIp}:3202` : 'app/retro-pce-fast/';
const locRetroStella = isDev() ? `${http}${localIp}:3312` : 'app/retro-stella/';
const locRetroStellaLatest = isDev() ? `${http}${localIp}:3314` : 'app/retro-stella-latest/';
const locRetroCommodore8Bit = isDev() ? `${http}${localIp}:3315` : 'app/retro-commodore-8bit/';
// const locRetroProsystem = isDev() ? `${http}${localIp}:3314` : 'app/retro-prosystem/';
const locPsx = isDev() ? `${http}${localIp}:3099` : 'app/psx/';
const loc7800 = isDev() ? `${http}${localIp}:3020` : 'app/7800/';
const locNes = isDev() ? `${http}${localIp}:3030` : 'app/nes/';
const locDoom = isDev() ? `${http}${localIp}:3040` : 'app/doom/';
const loc2600 = isDev() ? `${http}${localIp}:3050` : 'app/2600/';
const locSnes = isDev() ? `${http}${localIp}:3060` : 'app/snes/';
const locN64 = isDev() ? `${http}${localIp}:3065` : 'app/n64/';
const locGba = isDev() ? `${http}${localIp}:3070` : 'app/gba/';
const locNeo = isDev() ? `${http}${localIp}:3077` : 'app/neo/';
const locMednafen = isDev() ? `${http}${localIp}:3075` : 'app/mednafen/';
const locColeco = isDev() ? `${http}${localIp}:3303` : 'app/colem/';
const loc5200 = isDev() ? `${http}${localIp}:3304` : 'app/5200/';
const locPcfx = isDev() ? `${http}${localIp}:3305` : 'app/pcfx/';
const locRetro5200 = isDev() ? `${http}${localIp}:3306` : 'app/retro-a5200/';
const locRetroNeocd = isDev() ? `${http}${localIp}:3307` : 'app/retro-neocd/';
const locQuake = isDev() ? `${http}${localIp}:3308` : 'app/quake/';
const locRetro3dO = isDev() ? `${http}${localIp}:3311` : 'app/3do/';
const locScummVm = isDev() ? `${http}${localIp}:3313` : 'app/scummvm/';
const locRetroFceumm = isDev() ? `${http}${localIp}:3377` : 'app/retro-fceumm/';
const locRetroDosBoxPure = isDev() ? `${http}${localIp}:3333` : 'app/retro-dosbox-pure/';
const locRetroSaturn = isDev() ? `${http}${localIp}:3312` : 'app/saturn/';
const locRetroMelonDS = isDev() ? `${http}${localIp}:3444` : 'app/retro-melonds/';
// const locRetroParallelN64 = isDev() ? `${http}${localIp}:3309` : 'app/retro-n64/';
const locStandalone = isDev() ? `${http}${localIp}:3080` : 'app/standalone/';

const checkRom = app => {
  if (app.props === undefined || isEmptyString(app.props.rom)) {
    throw new Error("Missing 'rom' property");
  }
}

const checkArchive = app => {
  if (app.props === undefined || isEmptyString(app.props.archive)) {
    throw new Error("Missing 'archive' property");
  }
}

const checkDiscs = app => {
  if (app.props === undefined || app.props.discs === undefined || app.props.discs.length === 0) {
    throw new Error("Missing 'discs' property");
  }
}

const checkMedia = app => {
  if (app.props === undefined ||
      ((app.props.media === undefined || app.props.media.length === 0 ) &&
      (app.props.saveDisks === undefined || app.props.saveDisks <= 0))){
    throw new Error("Missing 'media' property");
  }
}

const APP_TYPE_KEYS = /*Object.freeze(*/{
  // Types
  AT5200: "a5200",
  BEETLE_PSX: "beetle-psx",
  BEETLE_PCFX: "beetle-pcfx",
  COLEM: "colem",
  COMMODORE_C64: "commodore-c64",
  DOS: "dos",
  FBNEO_ARCADE: "fbneo-arcade",
  FBNEO_CAPCOM: "fbneo-capcom",
  FBNEO_KONAMI: "fbneo-konami",
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
  PCFX: "pcfx",
  PRBOOM: "prboom",
  PSX: "psx",
  RETRO_COMMODORE_C64: "retro-commodore-c64",
  RETRO_GENPLUSGX_SEGACD: "retro-genplusgx-segacd",
  RETRO_PCE_FAST: "retro-pce-fast",
  RETRO_MELONDS: "retro-melonds",
  RETRO_NEOCD: "retro-neocd",
  RETRO_OPERA: "retro-opera",
  RETRO_PARALLEL_N64: "retro-parallel-n64",
  // RETRO_PROSYSTEM: "retro-prosystem",
  RETRO_STELLA: "retro-stella",
  RETRO_STELLA_LATEST: "retro-stella-latest",
  RETRO_FCEUMM: "retro-fceumm",
  RETRO_DOSBOX_PURE: "retro-dosbox-pure",
  RETRO_YABAUSE: "retro-yabause",
  SCUMMVM: "scummvm",
  SNES9X: "snes9x",
  TYRQUAKE: "tyrquake",
  VBA_M_GBA: "vba-m-gba",
  VBA_M_GB: "vba-m-gb",
  VBA_M_GBC: "vba-m-gbc",
  // Aliases
  A2600: "2600",
  A7800: "7800",
  ARCADE: "arcade",
  ARCADE_KONAMI: "arcade-konami",
  ARCADE_CAPCOM: "arcade-capcom",
  COLECO: "coleco",
  DOOM: "doom",
  GBA: "gba",
  GB: "gb",
  GBC: "gbc",
  GENESIS: "genesis",
  GG: "gg",
  LNX: "lnx",
  NDS: "nds",
  NEOGEO: "neogeo",
  NEOGEOCD: "neogeocd",
  NES: "nes",
  NGC: "ngc",
  NGP: "ngp",
  PCE: "pce",
  PCECD: "pcecd",
  QUAKE: "quake",
  SATURN: "saturn",
  SCUMM: "scumm",
  SEGACD: "segacd",
  SG1000: 'sg1000',
  SGX: 'sgx',
  SMS: "sms",
  SNES: "snes",
  THREEDO: "3do",
  VB: "vb",
  WSC: "wsc",
  WS: "ws"
}/*)*/;

const PCE_DEFAULTS = {
  rom: "",
  pad6button: false,
  zoomLevel: 0,
};

const WS_DEFAULTS = {
  rom: "",
  rotated: false,
  language: 0,
  zoomLevel: 0,
}

const NGP_DEFAULTS = {
  rom: "",
  language: 0,
  zoomLevel: 0,
}

const ARCADE_DEFAULTS = {
  rom: "",
  additionalRoms: [],
  volAdjust: 0,
  samples: "",
  playerOrder: "0:1:2:3",
  zoomLevel: 0
}

const types = [{
    key: APP_TYPE_KEYS.FBNEO_NEOGEO,
    alias: APP_TYPE_KEYS.NEOGEO,
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
      additionalRoms: [],
      volAdjust: 0,
      bios: 0,
      forceAesMode: false,
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.FBNEO_ARCADE,
    alias: APP_TYPE_KEYS.ARCADE,
    name: 'Arcade',
    shortName: 'Arcade',
    coreName: 'Final Burn Neo',
    location: locNeo,
    background: 'images/app/arcade-background.png',
    thumbnail: 'images/app/arcade-thumb.png',
    validate: checkRom,
    extensions: [],
    defaults: ARCADE_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.FBNEO_KONAMI,
    alias: APP_TYPE_KEYS.ARCADE_KONAMI,
    name: 'Arcade: Konami',
    shortName: 'Arcade: Konami',
    coreName: 'Final Burn Neo',
    location: locNeo,
    background: 'images/app/konami-background.png',
    thumbnail: 'images/app/konami-thumb.png',
    validate: checkRom,
    extensions: [],
    defaults: ARCADE_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.FBNEO_CAPCOM,
    alias: APP_TYPE_KEYS.ARCADE_CAPCOM,
    name: 'Arcade: Capcom',
    shortName: 'Arcade: Capcom',
    coreName: 'Final Burn Neo',
    location: locNeo,
    background: 'images/app/capcom-background.png',
    thumbnail: 'images/app/capcom-thumb.png',
    validate: checkRom,
    extensions: [],
    defaults: ARCADE_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.SNES9X,
    alias: APP_TYPE_KEYS.SNES,
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
      zoomLevel: 0,
      pal: false,
      port2: 0
    }
  }, {
    key: APP_TYPE_KEYS.JAVATARI,
    alias: APP_TYPE_KEYS.A2600,
    name: 'Atari 2600',
    coreName: 'Javatari',
    location: loc2600,
    thumbnail: "images/app/2600-thumb.png",
    background: "images/app/2600-background.png",
    validate: checkRom,
    extensions: ['a26'],
    defaults: {
      rom: "",
      swap: false,
      zoomLevel: 0,
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_STELLA,
    alias: APP_TYPE_KEYS.A2600,
    name: 'Atari 2600',
    coreName: 'Libretro Stella 2014',
    location: locRetroStella,
    thumbnail: "images/app/2600-thumb.png",
    background: "images/app/2600-background.png",
    validate: checkRom,
    extensions: ['a26'],
    defaults: {
      rom: "",
      swap: false,
      zoomLevel: 0,
      port0: 0,
      port1: 0,
      paddleSensitivity: 0,
      paddleCenter: 0,
      paddleVertical: false,
      paddleInverted: false,
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_COMMODORE_C64,
    alias: APP_TYPE_KEYS.COMMODORE_C64,
    name: 'Commodore 64',
    coreName: 'Libretro Commodore 64',
    location: locRetroCommodore8Bit,
    thumbnail: "images/app/c64-thumb.png",
    background: "images/app/c64-background.png",
    validate: checkMedia,
    extensions: ['d64', 'd81', 'g64', 't64', 'tap', 'crt', 'prg', 'nib', 'nbz'], // TODO: More, and check cartridges for proper header
    addProps: (feedProps, outProps) => {
      const bios = feedProps.commodore8bit_bios;
      if (bios) {
        outProps.commodore8bit_bios = bios;
      }
    },
    defaults: {
      uid: "",
      media: [],
      swap: false,
      zoomLevel: 0,
      jiffydos: 0,
      region: 0,
      saveDisks: 1,
      disableAutoload: false,
      disableTrueDriveEmulation: false,
      ramExpansion: 0,
      mappings: {},
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_STELLA_LATEST,
    alias: APP_TYPE_KEYS.A2600,
    name: 'Atari 2600',
    coreName: 'Libretro Stella',
    location: locRetroStellaLatest,
    thumbnail: "images/app/2600-thumb.png",
    background: "images/app/2600-background.png",
    validate: checkRom,
    extensions: ['a26'],
    defaults: {
      rom: "",
      swap: false,
      zoomLevel: 0,
      port0: 0,
      port1: 0,
      paddleSensitivity: 0,
      paddleCenter: 0,
      paddleVertical: false,
      paddleInverted: false,
    }
  // }, {
  //   key: APP_TYPE_KEYS.RETRO_PROSYSTEM,
  //   alias: APP_TYPE_KEYS.A7800,
  //   name: 'Atari 7800',
  //   coreName: 'Libretro ProSystem',
  //   location: locRetroProsystem,
  //   thumbnail: "images/app/7800-thumb.png",
  //   background: "images/app/7800-background.png",
  //   validate: checkRom,
  //   extensions: ['a78'],
  //   testMagic: Atari7800.testMagic,
  //   getMd5: Atari7800.getMd5,
  //   defaults: {
  //     rom: "",
  //     zoomLevel: 0,
  //   }
  }, {
    key: APP_TYPE_KEYS.JS7800,
    alias: APP_TYPE_KEYS.A7800,
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
      rom: "",
      zoomLevel: 0,
    }
  }, {
    key: APP_TYPE_KEYS.GENPLUSGX_MD,
    alias: APP_TYPE_KEYS.GENESIS,
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
      pad3button: false,
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.FCEUX,
    alias: APP_TYPE_KEYS.NES,
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
      pal: false,
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_FCEUMM,
    alias: APP_TYPE_KEYS.NES,
    name: 'Nintendo Entertainment System',
    shortName: 'Nintendo NES',
    coreName: 'Libretro FCEUmm',
    location: locRetroFceumm,
    background: 'images/app/nes-background.png',
    thumbnail: 'images/app/nes-thumb.png',
    validate: checkRom,
    extensions: ['nes', 'fds'],
    testMagic: Nes.testMagic,
    getMd5: Nes.getMd5,
    addProps: (feedProps, outProps) => {
      const rom = feedProps.fds_bios;
      if (rom) {
        outProps.fds_bios = rom;
      }
    },
    defaults: {
      rom: "",
      pal: false,
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.COLEM,
    alias: APP_TYPE_KEYS.COLECO,
    name: 'ColecoVision',
    shortName: 'ColecoVision',
    coreName: 'Colem',
    location: locColeco,
    background: 'images/app/colecovision-background.png',
    thumbnail: 'images/app/colecovision-thumb.png',
    validate: checkRom,
    extensions: ['col'],
    testMagic: Coleco.testMagic,
    testMagicLast: true,
    addProps: (feedProps, outProps) => {
      const rom = feedProps.coleco_rom;
      if (rom) {
        outProps.coleco_rom = rom;
      }
    },
    defaults: {
      rom: "",
      zoomLevel: 0,
      descriptions: {},
      mappings: {},
      controlsMode: 0
    }
  }, {
    key: APP_TYPE_KEYS.GENPLUSGX_SMS,
    alias: APP_TYPE_KEYS.SMS,
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
      ym2413: false,
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.GENPLUSGX_SG,
    alias: APP_TYPE_KEYS.SG1000,
    name: 'Sega SG-1000',
    coreName: 'Genesis Plus GX',
    location: locSms,
    background: 'images/app/sg1000-background.png',
    thumbnail: 'images/app/sg1000-thumb.png',
    validate: checkRom,
    extensions: ['sg'],
    defaults: {
      rom: "",
      pal: false,
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.GENPLUSGX_GG,
    alias: APP_TYPE_KEYS.GG,
    name: 'Sega Game Gear',
    coreName: 'Genesis Plus GX',
    location: locSms,
    background: 'images/app/gamegear-background.png',
    thumbnail: 'images/app/gamegear-thumb.png',
    validate: checkRom,
    extensions: ['gg'],
    defaults: {
      rom: "",
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.VBA_M_GBA,
    alias: APP_TYPE_KEYS.GBA,
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
      flashSize: 65536,
      disableLookup: false,
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.VBA_M_GB,
    alias: APP_TYPE_KEYS.GB,
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
      border: 0,
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.VBA_M_GBC,
    alias: APP_TYPE_KEYS.GBC,
    name: 'Nintendo Game Boy Color',
    shortName: 'Nintendo Game Boy Color',
    coreName: 'VBA-M',
    location: locGba,
    background: 'images/app/gbc-background.png',
    thumbnail: 'images/app/gbc-thumb.png',
    validate: checkRom,
    extensions: ['gbc'],
    defaults: {
      rom: "",
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.MEDNAFEN_PCE,
    alias: APP_TYPE_KEYS.PCE,
    name: 'NEC PC Engine',
    shortName: 'NEC PC Engine',
    coreName: 'Mednafen',
    location: locMednafen,
    background: 'images/app/pce-background.png',
    thumbnail: 'images/app/pce-thumb.png',
    validate: checkRom,
    extensions: ['pce'],
    defaults: {...PCE_DEFAULTS, mapRunSelect: false}
  }, {
    key: APP_TYPE_KEYS.MEDNAFEN_SGX,
    alias: APP_TYPE_KEYS.SGX,
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
    alias: APP_TYPE_KEYS.VB,
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
      pad6button: false,
      zoomLevel: 0,
    }
  }, {
    key: APP_TYPE_KEYS.MEDNAFEN_NGC,
    alias: APP_TYPE_KEYS.NGC,
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
    alias: APP_TYPE_KEYS.NGP,
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
    alias: APP_TYPE_KEYS.WSC,
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
    alias: APP_TYPE_KEYS.WS,
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
    alias: APP_TYPE_KEYS.LNX,
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
      rotation: 0,
      zoomLevel: 0,
    }
  }, {
    key: APP_TYPE_KEYS.BEETLE_PSX,
    alias: APP_TYPE_KEYS.PSX,
    name: 'Sony PlayStation',
    shortName: 'Sony PlayStation',
    coreName: 'Beetle PSX',
    location: locPsx,
    background: 'images/app/playstation-background.png',
    thumbnail: 'images/app/playstation-thumb.png',
    validate: checkDiscs,
    extensions: [],
    slowExit: true,
    addProps: (feedProps, outProps) => {
      const bios = feedProps.psx_bios;
      if (bios) {
        outProps.psx_bios = bios;
      }
    },
    defaults: {
      discs: [],
      sbi: [],
      multitap: false,
      analog: false,
      uid: "",
      zoomLevel: 0,
      skipBios: false,
      disableMemCard1: false
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_GENPLUSGX_SEGACD,
    alias: APP_TYPE_KEYS.SEGACD,
    name: 'Sega CD',
    shortName: 'Sega CD',
    coreName: 'Libretro Genesis Plus GX',
    location: locRetroGenesis,
    background: 'images/app/segacd-background.png',
    thumbnail: 'images/app/segacd-thumb.png',
    validate: checkDiscs,
    extensions: [],
    slowExit: true,
    addProps: (feedProps, outProps) => {
      const bios = feedProps.segacd_bios;
      if (bios) {
        outProps.segacd_bios = bios;
      }
    },
    defaults: {
      discs: [],
      uid: "",
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_PCE_FAST,
    alias: APP_TYPE_KEYS.PCECD,
    name: 'NEC PC Engine CD',
    shortName: 'NEC PC Engine CD',
    coreName: 'Libretro PCE Fast',
    location: locRetroPceFast,
    background: 'images/app/pcecd-background.png',
    thumbnail: 'images/app/pcecd-thumb.png',
    validate: checkDiscs,
    extensions: [],
    slowExit: true,
    addProps: (feedProps, outProps) => {
      const bios = feedProps.pcecd_bios;
      if (bios) {
        outProps.pcecd_bios = bios;
      }
    },
    defaults: {
      discs: [],
      uid: "",
      zoomLevel: 0,
      pad6button: false,
      mapRunSelect: false,
      customBios: ""
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_NEOCD,
    alias: APP_TYPE_KEYS.NEOGEOCD,
    name: 'SNK Neo Geo CD',
    shortName: 'SNK Neo Geo CD',
    coreName: 'Libretro NeoCD',
    location: locRetroNeocd,
    background: 'images/app/neogeocd-background.png',
    thumbnail: 'images/app/neogeocd-thumb.png',
    validate: checkDiscs,
    extensions: [],
    slowExit: true,
    addProps: (feedProps, outProps) => {
      const bios = feedProps.neogeocd_bios;
      if (bios) {
        outProps.neogeocd_bios = bios;
      }
    },
    defaults: {
      discs: [],
      uid: "",
      zoomLevel: 0,
      region: 0,
      cdSpeedHack: true,
      skipCdLoading: true
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_OPERA,
    alias: APP_TYPE_KEYS.THREEDO,
    name: '3DO',
    shortName: '3DO',
    coreName: 'Libretro Opera',
    location: locRetro3dO,
    background: 'images/app/3do-background.png',
    thumbnail: 'images/app/3do-thumb.png',
    validate: checkDiscs,
    extensions: [],
    slowExit: true,
    addProps: (feedProps, outProps) => {
      const bios = feedProps.threedo_bios;
      const fonts = feedProps.threedo_fonts;
      if (bios) {
        outProps.threedo_bios = bios;
      }
      if (fonts) {
        outProps.threedo_fonts = fonts;
      }
    },
    defaults: {
      discs: [],
      uid: "",
      zoomLevel: 0,
      hack: 0
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_YABAUSE,
    alias: APP_TYPE_KEYS.SATURN,
    name: 'Saturn',
    shortName: 'Saturn',
    coreName: 'Libretro Yabause',
    location: locRetroSaturn,
    background: 'images/app/3do-background.png',
    thumbnail: 'images/app/3do-thumb.png',
    validate: checkDiscs,
    extensions: [],
    slowExit: true,
    multiThreaded: true,
    addProps: (feedProps, outProps) => {
      // const bios = feedProps.threedo_bios;
      // if (bios) {
      //   outProps.threedo_bios = bios;
      // }
    },
    defaults: {
      discs: [],
      uid: "",
      zoomLevel: 0,
      // hack: 0
    }
  }, {
    key: APP_TYPE_KEYS.BEETLE_PCFX,
    alias: APP_TYPE_KEYS.PCFX,
    name: 'NEC PC-FX',
    shortName: 'NEC PC-FX',
    coreName: 'Beetle PC-FX',
    location: locPcfx,
    background: 'images/app/pcfx-background.png',
    thumbnail: 'images/app/pcfx-thumb.png',
    validate: checkDiscs,
    extensions: [],
    slowExit: true,
    addProps: (feedProps, outProps) => {
      const bios = feedProps.pcfx_bios;
      if (bios) {
        outProps.pcfx_bios = bios;
      }
    },
    defaults: {
      discs: [],
      uid: "",
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.TYRQUAKE,
    alias: APP_TYPE_KEYS.QUAKE,
    name: 'Quake',
    coreName: 'TyrQuake',
    slowExit: true,
    location: locQuake,
    background: 'images/app/quake-background.png',
    thumbnail: 'images/app/quake-thumb.png',
    validate: checkArchive,
    extensions: [],
    defaults: {
      archive: "",
      wadType: 0,
      wadPath: "",
      uid: "",
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_DOSBOX_PURE,
    alias: APP_TYPE_KEYS.DOS,
    name: 'DOS',
    coreName: 'Retro DosBox Pure',
    slowExit: true,
    location: locRetroDosBoxPure,
    background: 'images/app/dos-background.png',
    thumbnail: 'images/app/dos-thumb.png',
    validate: checkArchive,
    extensions: [],
    multiThreaded: true,
    defaults: {
      archive: "",
      autoStartPath: "",
      uid: "",
      controllerMode: 0,
      mouseSpeed: 0,
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_MELONDS,
    alias: APP_TYPE_KEYS.NDS,
    name: 'Nintendo DS',
    coreName: 'Retro MelonDS',
    slowExit: true,
    location: locRetroMelonDS,
    background: 'images/app/nds-background.png',
    thumbnail: 'images/app/nds-thumb.png',
    validate: checkRom,
    extensions: ['dsi', 'nds'],
    multiThreaded: true,
    addProps: (feedProps, outProps) => {
      const bios = feedProps.ds_bios;
      if (bios) {
        outProps.ds_bios = bios;
      }
    },
    defaults: {
      rom: "",
      zoomLevel: 0,
      screenLayout: "default",
      screenGap: false,
      bookMode: false,
      dualAnalog: false,
    }
  }, {
    key: APP_TYPE_KEYS.SCUMMVM,
    alias: APP_TYPE_KEYS.SCUMM,
    name: 'ScummVM',
    coreName: 'ScummVM',
    slowExit: true,
    location: locScummVm,
    background: 'images/app/scummvm-background.png',
    thumbnail: 'images/app/scummvm-thumb.png',
    validate: checkArchive,
    extensions: [],
    defaults: {
      archive: "",
      uid: "",
      zoomLevel: 0
    }
  },
  // {
  //   key: APP_TYPE_KEYS.RETRO_PARALLEL_N64,
  //   name: 'Nintendo 64',
  //   coreName: 'Libretro paraLLEl N64',
  //   location: locRetroParallelN64,
  //   background: 'images/app/n64-background.png',
  //   thumbnail: 'images/app/n64-thumb.png',
  //   validate: checkRom,
  //   extensions: ['n64', 'v64', 'z64'],
  //   isDelayedExit: true,
  //   defaults: {
  //     rom: "",
  //     zoomLevel: 0
  //   }
  // }
];

const addAlias = (types, alias, typeKey) => {
  const { key, ...props } = types.filter(t => t.key === typeKey)[0];
  types.push({ key: alias, absoluteKey: typeKey, ...props });
}

// Only add PRBoom on public server
if (config.isPublicServer()) {
  types.push({
    key: APP_TYPE_KEYS.PRBOOM,
    alias: APP_TYPE_KEYS.DOOM,
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

if (enable5200) {
  types.push({
    key: APP_TYPE_KEYS.AT5200,
    alias: APP_TYPE_KEYS.A5200,
    name: 'Atari 5200',
    coreName: 'A5200',
    location: loc5200,
    background: 'images/app/5200-background.png',
    thumbnail: 'images/app/5200-thumb.png',
    validate: checkRom,
    extensions: ['a52'],
    addProps: (feedProps, outProps) => {
      const rom = feedProps.atari_rom;
      if (rom) {
        outProps.atari_rom = rom;
      }
    },
    defaults: {
      zoomLevel: 0,
      rom: "",
      // descriptions: {},
      // mappings: {},
      // controlsMode: 0
    }
  });
  addAlias(types, APP_TYPE_KEYS.A5200, APP_TYPE_KEYS.AT5200);
}

// Aliases
// addAlias(types, APP_TYPE_KEYS.A2600, APP_TYPE_KEYS.RETRO_STELLA);
addAlias(types, APP_TYPE_KEYS.A2600, APP_TYPE_KEYS.RETRO_STELLA_LATEST);
addAlias(types, APP_TYPE_KEYS.A7800, APP_TYPE_KEYS.JS7800);
addAlias(types, APP_TYPE_KEYS.ARCADE, APP_TYPE_KEYS.FBNEO_ARCADE);
addAlias(types, APP_TYPE_KEYS.ARCADE_CAPCOM, APP_TYPE_KEYS.FBNEO_CAPCOM);
addAlias(types, APP_TYPE_KEYS.ARCADE_KONAMI, APP_TYPE_KEYS.FBNEO_KONAMI);
addAlias(types, APP_TYPE_KEYS.COLECO, APP_TYPE_KEYS.COLEM);
addAlias(types, APP_TYPE_KEYS.COMMODORE_C64, APP_TYPE_KEYS.RETRO_COMMODORE_C64);
addAlias(types, APP_TYPE_KEYS.DOS, APP_TYPE_KEYS.RETRO_DOSBOX_PURE);
addAlias(types, APP_TYPE_KEYS.GBA, APP_TYPE_KEYS.VBA_M_GBA);
addAlias(types, APP_TYPE_KEYS.GB, APP_TYPE_KEYS.VBA_M_GB);
addAlias(types, APP_TYPE_KEYS.GBC, APP_TYPE_KEYS.VBA_M_GBC);
addAlias(types, APP_TYPE_KEYS.GENESIS, APP_TYPE_KEYS.GENPLUSGX_MD);
addAlias(types, APP_TYPE_KEYS.GG, APP_TYPE_KEYS.GENPLUSGX_GG);
addAlias(types, APP_TYPE_KEYS.LNX, APP_TYPE_KEYS.MEDNAFEN_LNX);
addAlias(types, APP_TYPE_KEYS.NEOGEO, APP_TYPE_KEYS.FBNEO_NEOGEO);
addAlias(types, APP_TYPE_KEYS.NEOGEOCD, APP_TYPE_KEYS.RETRO_NEOCD);
addAlias(types, APP_TYPE_KEYS.NDS, APP_TYPE_KEYS.RETRO_MELONDS);
addAlias(types, APP_TYPE_KEYS.NES, APP_TYPE_KEYS.FCEUX);
addAlias(types, APP_TYPE_KEYS.NGC, APP_TYPE_KEYS.MEDNAFEN_NGC);
addAlias(types, APP_TYPE_KEYS.NGP, APP_TYPE_KEYS.MEDNAFEN_NGP);
addAlias(types, APP_TYPE_KEYS.PCE, APP_TYPE_KEYS.MEDNAFEN_PCE);
addAlias(types, APP_TYPE_KEYS.PCECD, APP_TYPE_KEYS.RETRO_PCE_FAST);
addAlias(types, APP_TYPE_KEYS.PCFX, APP_TYPE_KEYS.BEETLE_PCFX);
addAlias(types, APP_TYPE_KEYS.PSX, APP_TYPE_KEYS.BEETLE_PSX);
addAlias(types, APP_TYPE_KEYS.QUAKE, APP_TYPE_KEYS.TYRQUAKE);
addAlias(types, APP_TYPE_KEYS.SATURN, APP_TYPE_KEYS.RETRO_YABAUSE);
addAlias(types, APP_TYPE_KEYS.SCUMM, APP_TYPE_KEYS.SCUMMVM);
addAlias(types, APP_TYPE_KEYS.SEGACD, APP_TYPE_KEYS.RETRO_GENPLUSGX_SEGACD);
addAlias(types, APP_TYPE_KEYS.SG1000, APP_TYPE_KEYS.GENPLUSGX_SG);
addAlias(types, APP_TYPE_KEYS.SGX, APP_TYPE_KEYS.MEDNAFEN_SGX);
addAlias(types, APP_TYPE_KEYS.SMS, APP_TYPE_KEYS.GENPLUSGX_SMS);
addAlias(types, APP_TYPE_KEYS.SNES, APP_TYPE_KEYS.SNES9X);
addAlias(types, APP_TYPE_KEYS.THREEDO, APP_TYPE_KEYS.RETRO_OPERA);
addAlias(types, APP_TYPE_KEYS.VB, APP_TYPE_KEYS.MEDNAFEN_VB);
addAlias(types, APP_TYPE_KEYS.WSC, APP_TYPE_KEYS.MEDNAFEN_WSC);
addAlias(types, APP_TYPE_KEYS.WS, APP_TYPE_KEYS.MEDNAFEN_WS);

const APP_TYPES = types;

const enableExperimentalApps = (b) => {

  //
  // Remove N64
  //

  let clone = [...APP_TYPES];
  APP_TYPES.length = 0;
  for (let i = 0; i < clone.length; i++) {
    const t = clone[i];
    if ((!APP_TYPE_KEYS.PARALLEL_N64 || t.key !== APP_TYPE_KEYS.PARALLEL_N64) &&
        (!APP_TYPE_KEYS.N64 || t.key !== APP_TYPE_KEYS.N64)) {
      APP_TYPES.push(t);
    }
  }

  delete APP_TYPE_KEYS.PARALLEL_N64;
  delete APP_TYPE_KEYS.N64;

  //
  // Add N64
  //

  if (b) {
    APP_TYPE_KEYS.PARALLEL_N64 = "parallel-n64";
    APP_TYPE_KEYS.N64 = "n64";

    APP_TYPES.push({
      key: APP_TYPE_KEYS.PARALLEL_N64,
      alias: APP_TYPE_KEYS.N64,
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
          url = UrlUtil.addParam(url, N64_SKIP_RP, n64skip);
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
        rom: "",
        zoomLevel: 0
      }
    });
    addAlias(APP_TYPES, APP_TYPE_KEYS.N64, APP_TYPE_KEYS.PARALLEL_N64);
  }

  //
  // Remove 5200
  //

  for (let i = 0; i < clone.length; i++) {
    const t = clone[i];
    if ((!APP_TYPE_KEYS.RETRO_A5200 || t.key !== APP_TYPE_KEYS.RETRO_A5200) &&
        (!APP_TYPE_KEYS.A5200 || t.key !== APP_TYPE_KEYS.A5200)) {
      APP_TYPES.push(t);
    }
  }

  delete APP_TYPE_KEYS.RETRO_A5200;
  delete APP_TYPE_KEYS.A5200;

  //
  // Add 5200
  //

  if (b) {
    APP_TYPE_KEYS.RETRO_A5200 = "retro-5200";
    APP_TYPE_KEYS.A5200 = "5200";

    APP_TYPES.push({
      key: APP_TYPE_KEYS.RETRO_A5200,
      alias: APP_TYPE_KEYS.A5200,
      name: 'Atari 5200',
      coreName: 'Libretro A5200',
      location: locRetro5200,
      background: 'images/app/5200-background.png',
      thumbnail: 'images/app/5200-thumb.png',
      validate: checkRom,
      extensions: ['a52'],
      addProps: (feedProps, outProps) => {
        const rom = feedProps.atari5200_rom;
        if (rom) {
          outProps.atari5200_rom = rom;
        }
      },
      defaults: {
        rom: "",
        zoomLevel: 0,
        swap: false,
        analog: false,
        twinStick: false,
        descriptions: {},
        mappings: {},
      }
    });
    addAlias(types, APP_TYPE_KEYS.A5200, APP_TYPE_KEYS.RETRO_A5200);

  }
}

const getStandaloneLocation = () => {
  return locStandalone;
}

export { enableExperimentalApps, getStandaloneLocation, APP_TYPE_KEYS, APP_TYPES };
