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

const localIp = config.getLocalIp();
// const localIp = "192.168.1.157"; // config.getLocalIp();
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
const locRetroPokeMini = isDev() ? `${http}${localIp}:3555` : 'app/retro-pokemini/';
const locRetroSnes9x = isDev() ? `${http}${localIp}:3378` : 'app/retro-snes9x/';
const locRetroMednafenLynx = isDev() ? `${http}${localIp}:3379` : 'app/retro-mednafen-lynx/';
const locRetroMednafenNgp = isDev() ? `${http}${localIp}:3380` : 'app/retro-mednafen-npg/';
const locRetroMednafenSgx = isDev() ? `${http}${localIp}:3381` : 'app/retro-mednafen-sgx/';
const locRetroMednafenVb = isDev() ? `${http}${localIp}:3382` : 'app/retro-mednafen-vb/';
const locRetroMednafenWswan = isDev() ? `${http}${localIp}:3383` : 'app/retro-mednafen-wswan/';
const locRetroMgba = isDev() ? `${http}${localIp}:3384` : 'app/retro-mgba/';
const locRetroSameboy = isDev() ? `${http}${localIp}:3385` : 'app/retro-sameboy/';
//const locRetroPpsspp = isDev() ? `${http}${localIp}:3386` : 'app/retro-ppsspp/';
// const locRetroSameCdi = isDev() ? `${http}${localIp}:3386` : 'app/retro-samecdi/';
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
  RETRO_GENPLUSGX_GG: "retro-genplusgx-gg",
  RETRO_GENPLUSGX_MD: "retro-genplusgx-md",
  RETRO_GENPLUSGX_SEGACD: "retro-genplusgx-segacd",
  RETRO_GENPLUSGX_SG: "retro-genplusgx-sg",
  RETRO_GENPLUSGX_SMS: "retro-genplusgx-sms",
  RETRO_MEDNAFEN_LYNX: "retro-mednafen-lynx",
  RETRO_MEDNAFEN_NGC: "retro-mednafen-npc",
  RETRO_MEDNAFEN_NGP: "retro-mednafen-ngp",
  RETRO_MEDNAFEN_PCE: "retro-mednafen-pce",
  RETRO_MEDNAFEN_SGX: "retro-mednafen-sgx",
  RETRO_MEDNAFEN_VB: "retro-mednafen-vb",
  RETRO_MEDNAFEN_WS: "retro-mednafen-ws",
  RETRO_MEDNAFEN_WSC: "retro-mednafen-wsc",
  RETRO_MGBA: "retro-mgba-gba",
  RETRO_PCE_FAST: "retro-pce-fast",
  //RETRO_PPSSPP: "retro-ppsspp",
  RETRO_MELONDS: "retro-melonds",
  RETRO_NEOCD: "retro-neocd",
  RETRO_OPERA: "retro-opera",
  RETRO_PARALLEL_N64: "retro-parallel-n64",
  RETRO_POKEMINI: "retro-pokemini",
  // RETRO_PROSYSTEM: "retro-prosystem",
  RETRO_SNES9X: "retro-snes9x",
  RETRO_STELLA: "retro-stella",
  RETRO_STELLA_LATEST: "retro-stella-latest",
  RETRO_FCEUMM: "retro-fceumm",
  RETRO_DOSBOX_PURE: "retro-dosbox-pure",
  RETRO_SAMEBOY_GB: "retro-sameboy-gb",
  RETRO_SAMEBOY_GBC: "retro-sameboy-gbc",
  // RETRO_SAME_CDI: "retro-same-cdi",
  // RETRO_YABAUSE: "retro-yabause",
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
  // CDI: "cdi",
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
  POKEMINI: "pokemini",
  //PSP: "psp",
  QUAKE: "quake",
  // SATURN: "saturn",
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
    description: "A standalone, highly accurate emulator that specializes in arcade systems, with a strong focus on Neo Geo. It's considered a top-tier choice for an authentic, high-performance experience.",
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
    description: "The standalone version of the Final Burn Neo emulator, which supports a massive library of arcade games. It is actively updated and praised for its broad compatibility and accuracy.",
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
    description: "This uses the standalone Final Burn Neo emulator, specifically to run the classic arcade titles developed by Konami. It offers high-fidelity emulation for these specific games.",
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
    description: "A standalone instance of the Final Burn Neo emulator, focused on providing an authentic experience for the iconic library of Capcom arcade games.",
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
    description: "A classic standalone emulator for the Super Nintendo. It is renowned for being lightweight, fast, and highly compatible, making it an excellent choice for a wide range of hardware, including less powerful devices. This emulator is more performant than the Libretro SNES9X emulator, but it does not support advanced features like shaders.",
    validate: checkRom,
    extensions: ['smc', 'sfc', 'swc'],
    defaults: {
      rom: "",
      zoomLevel: 0,
      pal: false,
      port2: 0
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_SNES9X,
    alias: APP_TYPE_KEYS.SNES,
    name: 'Super Nintendo',
    shortName: 'Nintendo SNES',
    coreName: 'Libretro SNES9X',
    location: locRetroSnes9x,
    thumbnail: "images/app/snes-thumb.png",
    background: "images/app/snes-background.png",
    description: "A Libretro core using a more recent version of the SNES9X emulator, which may provide improved game compatibility. It enables support for advanced graphical shaders, but this comes at the cost of increased system resources compared to the standalone version.",
    validate: checkRom,
    extensions: ['smc', 'sfc', 'swc'],
    defaults: {
      rom: "",
      cheat: "",
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
    description: "A standalone emulator for the Atari 2600 written in JavaScript. It generally offers lower game compatibility compared to the other available options.",
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
    description: "An older, but very stable and performant Libretro core of the Stella emulator. It supports advanced graphical shaders and is a good choice for low-power devices, though it may lack some accuracy improvements found in the latest versions.",
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
    description: "A versatile Libretro core for emulating the Commodore 64 home computer. It aims for high accuracy to support the C64's vast library of software and games, with full support for features like shaders to replicate the look of a classic CRT monitor.",
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
    description: "The most up-to-date Libretro core of the Stella emulator. This is the recommended choice for its high accuracy and the best compatibility with homebrew and difficult-to-emulate games, with full support for advanced graphical shaders.",
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
    description: "A standalone JavaScript-based emulator for the Atari 7800. It has been updated to support all modern homebrew titles and is the core 7800 emulator used in the Atari 2600+/7800+ consoles.",
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
    description: "A standalone version of the highly accurate Genesis Plus GX emulator. While not as up-to-date as the Libretro version, it has lower system resource requirements and provides an authentic experience without support for advanced features like graphical shaders.",
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
    key: APP_TYPE_KEYS.RETRO_GENPLUSGX_MD,
    alias: APP_TYPE_KEYS.GENESIS,
    name: 'Sega Genesis',
    coreName: 'Libretro Genesis Plus GX',
    location: locRetroGenesis,
    background: 'images/app/genesis-background.png',
    thumbnail: 'images/app/genesis-thumb.png',
    description: "The Libretro port of Genesis Plus GX, widely considered the gold standard for emulating 8-bit and 16-bit Sega consoles due to its extremely high accuracy. This version adds support for advanced graphical shaders at the cost of higher system resource requirements.",
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
    description: "A performant, standalone NES emulator with high compatibility for cartridge-based titles. It is not as up-to-date as the Libretro FCEUmm core, doesn't currently support Famicom Disk System (FDS) games, and lacks support for graphical shaders.",
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
    description: "A popular and highly reliable Libretro core for the NES that offers excellent game compatibility. It adds support for the Famicom Disk System (FDS) and advanced graphical shaders, making it more resource-intensive than the standalone FCEUX emulator.",
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
      cheat: "",
      pal: false,
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_POKEMINI,
    alias: APP_TYPE_KEYS.POKEMINI,
    name: 'Nintendo Pokémon Mini',
    shortName: 'Nintendo Pokémon Mini',
    coreName: 'Libretro Pokémon Mini',
    location: locRetroPokeMini,
    background: 'images/app/pokemini-background.png',
    thumbnail: 'images/app/pokemini-thumb.png',
    description: "A specialized Libretro core designed to accurately emulate the niche Nintendo Pokémon Mini handheld console, preserving its unique library of games and making them playable today. This core also supports advanced graphical shaders.",
    validate: checkRom,
    extensions: ['min'],
    // testMagic: Nes.testMagic,
    // getMd5: Nes.getMd5,
    // addProps: (feedProps, outProps) => {
    //   const rom = feedProps.fds_bios;
    //   if (rom) {
    //     outProps.fds_bios = rom;
    //   }
    // },
    defaults: {
      rom: "",
      // pal: false,
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
    description: "A standalone emulator core for the ColecoVision. It is designed to be a straightforward and compatible option for playing the classic library of games from this early 1980s system.",
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
    description: "This standalone core uses the Genesis Plus GX engine for highly accurate Sega Master System emulation. It offers higher performance than the Libretro version, but it is not as up-to-date and does not support graphical shaders.",
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
      key: APP_TYPE_KEYS.RETRO_GENPLUSGX_SMS,
      alias: APP_TYPE_KEYS.SMS,
      name: 'Sega Master System',
      coreName: 'Libretro Genesis Plus GX',
      location: locRetroGenesis,
      background: 'images/app/mastersystem-background.png',
      thumbnail: 'images/app/mastersystem-thumb.png',
      description: "The Libretro port of Genesis Plus GX for the Sega Master System. This more up-to-date version may offer increased game compatibility and supports advanced graphical shaders, at the cost of being more resource-intensive.",
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
    description: "This standalone core uses the Genesis Plus GX engine for highly accurate SG-1000 emulation. It offers higher performance than the Libretro version, but it is not as up-to-date and does not support graphical shaders.",
    validate: checkRom,
    extensions: ['sg'],
    defaults: {
      rom: "",
      pal: false,
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_GENPLUSGX_SG,
    alias: APP_TYPE_KEYS.SG1000,
    name: 'Sega SG-1000',
    coreName: 'Libretro Genesis Plus GX',
    location: locRetroGenesis,
    background: 'images/app/sg1000-background.png',
    thumbnail: 'images/app/sg1000-thumb.png',
    description: "The Libretro port of Genesis Plus GX for the Sega SG-1000. This more up-to-date version may offer increased game compatibility and supports advanced graphical shaders, at the cost of being more resource-intensive.",
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
    description: "This standalone core uses the Genesis Plus GX engine for highly accurate Sega Game Gear emulation. It offers higher performance than the Libretro version, but it is not as up-to-date and does not support graphical shaders.",
    validate: checkRom,
    extensions: ['gg'],
    defaults: {
      rom: "",
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_GENPLUSGX_GG,
    alias: APP_TYPE_KEYS.GG,
    name: 'Sega Game Gear',
    coreName: 'Libretro Genesis Plus GX',
    location: locRetroGenesis,
    background: 'images/app/gamegear-background.png',
    thumbnail: 'images/app/gamegear-thumb.png',
    description: "The Libretro port of Genesis Plus GX for the Sega Game Gear. This more up-to-date version may offer increased game compatibility and supports advanced graphical shaders, at the cost of being more resource-intensive.",
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
    description: "A standalone GBA emulator focused on performance. While not as up-to-date as the mGBA core and lacking support for graphical shaders, it is less resource-intensive, making it an excellent choice for lower-end hardware.",
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
    },
    getSavePath(isCloud, key) {
      const path = getAppStoragePath(APP_TYPE_KEYS.VBA_M_GBA, key);
      return isCloud ? path : path + "/sav";
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_MGBA,
    alias: APP_TYPE_KEYS.GBA,
    name: 'Nintendo Game Boy Advance',
    shortName: 'Nintendo GBA',
    coreName: 'Libretro mGBA',
    location: locRetroMgba,
    background: 'images/app/gba-background.png',
    thumbnail: 'images/app/gba-thumb.png',
    validate: checkRom,
    description: "A modern and extremely accurate Libretro core for the GBA. It is the best option for authenticity and compatibility with new homebrew, and includes support for advanced graphical shaders. It is more demanding than VBA-M but provides a superior experience.",
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
    },
    newDefaultDate: 1765510513694, // Thu Dec 11 2025 19:35:13 GMT-0800 (Pacific Standard Time)
    oldDefault: APP_TYPE_KEYS.VBA_M_GBA,
    getSavePath(isCloud, key) {
      const path = AppRegistry.instance.getStoragePath(APP_TYPE_KEYS.RETRO_MGBA, key);
      return isCloud ? path : path + "/sav.zip";
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
    description: "This standalone VBA-M core offers high performance for emulating the original Nintendo Game Boy. It is not as up-to-date as the SameBoy core and does not support graphical shaders.",
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
    description: "This standalone VBA-M core prioritizes speed and compatibility for Game Boy Color emulation. It is not as up-to-date as the SameBoy core and does not support graphical shaders.",
    validate: checkRom,
    extensions: ['gbc'],
    defaults: {
      rom: "",
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_SAMEBOY_GB,
    alias: APP_TYPE_KEYS.GB,
    name: 'Nintendo Game Boy',
    shortName: 'Nintendo Game Boy',
    coreName: 'Libretro SameBoy',
    location: locRetroSameboy,
    background: 'images/app/gb-background.png',
    thumbnail: 'images/app/gb-thumb.png',
    description: "A Libretro core that prioritizes extremely high accuracy for an authentic hardware experience, making it perfect for developers and purists. It supports advanced graphical shaders but requires more system resources than other options.",
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
    key: APP_TYPE_KEYS.RETRO_SAMEBOY_GBC,
    alias: APP_TYPE_KEYS.GBC,
    name: 'Nintendo Game Boy Color',
    shortName: 'Nintendo Game Boy Color',
    coreName: 'Libretro SameBoy',
    location: locRetroSameboy,
    background: 'images/app/gbc-background.png',
    thumbnail: 'images/app/gbc-thumb.png',
    description: "An accuracy-focused Libretro core that perfectly replicates the Game Boy Color hardware, making it ideal for an authentic experience. It supports advanced graphical shaders but requires more system resources than other options.",
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
    description: "A standalone version of the highly accurate Mednafen emulator for the PC Engine. It has lower system resource requirements but is not as up-to-date as the Libretro version and does not support graphical shaders.",
    validate: checkRom,
    extensions: ['pce'],
    defaults: {...PCE_DEFAULTS, mapRunSelect: false}
  }, {
    key: APP_TYPE_KEYS.RETRO_MEDNAFEN_PCE,
    alias: APP_TYPE_KEYS.PCE,
    name: 'NEC PC Engine',
    shortName: 'NEC PC Engine',
    coreName: 'Libretro Mednafen PCE Fast',
    location: locRetroPceFast,
    background: 'images/app/pce-background.png',
    thumbnail: 'images/app/pce-thumb.png',
    description: "A more up-to-date Libretro core based on Mednafen\'s PC Engine module, optimized for fast performance. It provides an excellent balance of speed and high accuracy, and adds support for advanced graphical shaders at the cost of higher system resource requirements.",
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
    description: "A standalone version of the highly accurate Mednafen emulator for the NEC SuperGrafx. It has lower system resource requirements but is not as up-to-date as the Libretro version and does not support graphical shaders.",
    validate: checkRom,
    extensions: ['sgx'],
    defaults: PCE_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.RETRO_MEDNAFEN_SGX,
    alias: APP_TYPE_KEYS.SGX,
    name: 'NEC SuperGrafx',
    shortName: 'NEC SuperGrafx',
    coreName: 'Libretro Mednafen SuperGrafx',
    location: locRetroMednafenSgx,
    background: 'images/app/sgx-background.png',
    thumbnail: 'images/app/sgx-thumb.png',
    description: "A more up-to-date Libretro core powered by Mednafen for emulating the NEC SuperGrafx. It offers high accuracy and supports advanced graphical shaders, at the cost of higher system resource requirements.",
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
    description: "A standalone version of the highly accurate Mednafen emulator for the Nintendo Virtual Boy. It has lower system resource requirements but is not as up-to-date as the Libretro version and does not support graphical shaders.",
    validate: checkRom,
    extensions: ['vb'], // TODO: More?
    defaults: {
      rom: "",
      pad6button: false,
      zoomLevel: 0,
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_MEDNAFEN_VB,
    alias: APP_TYPE_KEYS.VB,
    name: 'Nintendo Virtual Boy',
    shortName: 'Nintendo Virtual Boy',
    coreName: 'Libretro Mednafen VB',
    location: locRetroMednafenVb,
    background: 'images/app/vb-background.png',
    thumbnail: 'images/app/vb-thumb.png',
    description: "A more up-to-date Libretro core powered by Mednafen for emulating the Nintendo Virtual Boy. It offers high accuracy and supports advanced graphical shaders, at the cost of higher system resource requirements.",
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
    description: "A standalone version of the highly accurate Mednafen emulator for the SNK Neo Geo Pocket Color. It has lower system resource requirements but is not as up-to-date as the Libretro version and does not support graphical shaders.",
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
    description: "A standalone version of the highly accurate Mednafen emulator for the SNK Neo Geo Pocket. It has lower system resource requirements but is not as up-to-date as the Libretro version and does not support graphical shaders.",
    validate: checkRom,
    extensions: ['ngp'],
    defaults: NGP_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.RETRO_MEDNAFEN_NGC,
    alias: APP_TYPE_KEYS.NGC,
    name: 'SNK Neo Geo Pocket Color',
    shortName: 'SNK Neo Geo Pocket Color',
    coreName: 'Libretro Mednafen NGP',
    location: locRetroMednafenNgp,
    background: 'images/app/ngc-background.png',
    thumbnail: 'images/app/ngc-thumb.png',
    description: "A more up-to-date Libretro core powered by Mednafen for emulating the SNK Neo Geo Pocket Color. It offers high accuracy and supports advanced graphical shaders, at the cost of higher system resource requirements.",
    validate: checkRom,
    extensions: ['ngc'],
    defaults: NGP_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.RETRO_MEDNAFEN_NGP,
    alias: APP_TYPE_KEYS.NGP,
    name: 'SNK Neo Geo Pocket',
    shortName: 'SNK Neo Geo Pocket',
    coreName: 'Libretro Mednafen NGP',
    location: locRetroMednafenNgp,
    background: 'images/app/ngp-background.png',
    thumbnail: 'images/app/ngp-thumb.png',
    description: "A more up-to-date Libretro core powered by Mednafen for emulating the SNK Neo Geo Pocket. It offers high accuracy and supports advanced graphical shaders, at the cost of higher system resource requirements.",
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
    description: "A standalone version of the highly accurate Mednafen emulator for the Bandai WonderSwan Color. It has lower system resource requirements but is not as up-to-date as the Libretro version and does not support graphical shaders.",
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
    description: "A standalone version of the highly accurate Mednafen emulator for the Bandai WonderSwan. It has lower system resource requirements but is not as up-to-date as the Libretro version and does not support graphical shaders.",
    validate: checkRom,
    extensions: ['ws'],
    defaults: WS_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.RETRO_MEDNAFEN_WSC,
    alias: APP_TYPE_KEYS.WSC,
    name: 'Bandai WonderSwan Color',
    shortName: 'Bandai WonderSwan Color',
    coreName: 'Libretro Mednafen Wswan',
    location: locRetroMednafenWswan,
    background: 'images/app/wsc-background.png',
    thumbnail: 'images/app/wsc-thumb.png',
    description: "A more up-to-date Libretro core powered by Mednafen for emulating the Bandai WonderSwan Color. It offers high accuracy and supports advanced graphical shaders, at the cost of higher system resource requirements.",
    validate: checkRom,
    extensions: ['wsc'],
    defaults: WS_DEFAULTS
  }, {
    key: APP_TYPE_KEYS.RETRO_MEDNAFEN_WS,
    alias: APP_TYPE_KEYS.WS,
    name: 'Bandai WonderSwan',
    shortName: 'Bandai WonderSwan',
    coreName: 'Libretro Mednafen Wswan',
    location: locRetroMednafenWswan,
    background: 'images/app/ws-background.png',
    thumbnail: 'images/app/ws-thumb.png',
    description: "A more up-to-date Libretro core powered by Mednafen for emulating the Bandai WonderSwan. It offers high accuracy and supports advanced graphical shaders, at the cost of higher system resource requirements.",
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
    description: "A standalone version of the highly accurate Mednafen emulator for the Atari Lynx. It has lower system resource requirements but is not as up-to-date as the Libretro version and does not support graphical shaders.",
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
      rotation: -1,
      zoomLevel: 0,
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_MEDNAFEN_LYNX,
    alias: APP_TYPE_KEYS.LNX,
    name: 'Atari Lynx',
    shortName: 'Atari Lynx',
    coreName: 'Libretro Mednafen Lynx',
    location: locRetroMednafenLynx,
    background: 'images/app/lynx-background.png',
    thumbnail: 'images/app/lynx-thumb.png',
    description: "A more up-to-date Libretro core powered by Mednafen for emulating the Atari Lynx. It offers high accuracy and supports advanced graphical shaders, at the cost of higher system resource requirements.",
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
      rotation: -1,
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
    description: "A Libretro core renowned for its extremely high accuracy in replicating the original PlayStation hardware. It supports advanced graphical shaders but is more resource-intensive, providing the most authentic experience.",
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
      disableMemCard1: false,
      cheat: ""
    }
  // }, {
  //   key: APP_TYPE_KEYS.RETRO_PPSSPP,
  //   alias: APP_TYPE_KEYS.PSP,
  //   name: 'Sony PSP',
  //   shortName: 'Sony PSP',
  //   coreName: 'Retro PPSSPP',
  //   location: locRetroPpsspp,
  //   background: 'images/app/playstation-background.png',
  //   thumbnail: 'images/app/playstation-thumb.png',
  //   description: "",
  //   validate: checkDiscs,
  //   extensions: [],
  //   multiThreaded: true,
  //   slowExit: true,
  //   // addProps: (feedProps, outProps) => {
  //   //   const bios = feedProps.psx_bios;
  //   //   if (bios) {
  //   //     outProps.psx_bios = bios;
  //   //   }
  //   // },
  //   defaults: {
  //     discs: [],
  //     // sbi: [],
  //     // multitap: false,
  //     // analog: false,
  //     uid: "",
  //     zoomLevel: 0,
  //     // skipBios: false,
  //     // disableMemCard1: false
  //   }
  }, {
    key: APP_TYPE_KEYS.RETRO_GENPLUSGX_SEGACD,
    alias: APP_TYPE_KEYS.SEGACD,
    name: 'Sega CD',
    shortName: 'Sega CD',
    coreName: 'Libretro Genesis Plus GX',
    location: locRetroGenesis,
    background: 'images/app/segacd-background.png',
    thumbnail: 'images/app/segacd-thumb.png',
    description: "This Libretro core extends the highly accurate Genesis Plus GX engine to emulate the Sega CD add-on. It\'s the top choice for reliable and authentic Sega CD gameplay and includes support for advanced graphical shaders",
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
      pal: false,
      pad3button: false,
      zoomLevel: 0
    }
  }, {
    key: APP_TYPE_KEYS.RETRO_PCE_FAST,
    alias: APP_TYPE_KEYS.PCECD,
    name: 'NEC PC Engine CD',
    shortName: 'NEC PC Engine CD',
    coreName: 'Libretro Mednafen PCE Fast',
    location: locRetroPceFast,
    background: 'images/app/pcecd-background.png',
    thumbnail: 'images/app/pcecd-thumb.png',
    description: "A performance-optimized Libretro core from Mednafen for playing PC Engine CD / TurboGrafx-CD games. It offers a great balance of speed and high compatibility, with support for advanced graphical shaders.",
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
    description: "A specialized Libretro core for the Neo Geo CD that includes options to significantly reduce or skip the console\'s infamous loading times, greatly improving the user experience. This core also supports advanced graphical shaders.",
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
    description: "A Libretro core for emulating the 3DO Interactive Multiplayer, based on the 4DO emulator. It is the primary choice for playing the 3DO\'s unique library of games and includes support for advanced graphical shaders.",
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
    key: APP_TYPE_KEYS.BEETLE_PCFX,
    alias: APP_TYPE_KEYS.PCFX,
    name: 'NEC PC-FX',
    shortName: 'NEC PC-FX',
    coreName: 'Beetle PC-FX',
    location: locPcfx,
    background: 'images/app/pcfx-background.png',
    thumbnail: 'images/app/pcfx-thumb.png',
    description: "A Libretro core from Mednafen for emulating the 32-bit NEC PC-FX. It provides accurate emulation for this rare, Japan-only console, preserving its unique library of full-motion video games, and includes support for advanced graphical shaders.",
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
    description: "This is not an emulator but a standalone source port for the classic first-person shooter Quake. It offers a faithful experience, ensures compatibility with modern hardware, and includes support for advanced graphical shaders.",
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
    description: "A user-friendly Libretro core version of DOSBox that is heavily optimized for ease-of-use. It simplifies the process of playing classic DOS games by automatically handling configurations and supports advanced graphical shaders.",
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
    description: "A modern and highly accurate Libretro core for the Nintendo DS. It is actively developed, offers great performance, supports advanced graphical shaders, and is an excellent choice for the entire DS library.",
    validate: checkRom,
    extensions: ['dsi', 'nds'],
    multiThreaded: true,
    addProps: (feedProps, outProps) => {
      const bios = feedProps.ds_bios;
      if (bios) {
        outProps.ds_bios = bios;
      }
      const nickname = feedProps.ds_nickname;
      if (nickname) {
        const nick = nickname.trim();
        if (nick.length > 0) {
          outProps.ds_nickname = nick;
        }
      }
    },
    defaults: {
      rom: "",
      zoomLevel: 0,
      screenLayout: "default",
      screenGap: false,
      bookMode: false,
      dualAnalog: false,
      microphone: false,
    }
  // }, {
  //   key: APP_TYPE_KEYS.RETRO_SAME_CDI,
  //   alias: APP_TYPE_KEYS.CDI,
  //   name: 'Philips CDI',
  //   shortName: 'Philips CDI',
  //   coreName: 'Libretro SameCDI',
  //   location: locRetroSameCdi,
  //   background: 'images/app/neogeocd-background.png',
  //   thumbnail: 'images/app/neogeocd-thumb.png',
  //   description: "TODO",
  //   validate: checkDiscs,
  //   extensions: [],
  //   slowExit: true,
  //   addProps: (feedProps, outProps) => {
  //     const bios = feedProps.philipscdi_bios;
  //     if (bios) {
  //       outProps.philipscdi_bios = bios;
  //     }
  //   },
  //   defaults: {
  //     discs: [],
  //     uid: "",
  //     zoomLevel: 0,
  //   }
  }, {
    key: APP_TYPE_KEYS.SCUMMVM,
    alias: APP_TYPE_KEYS.SCUMM,
    name: 'ScummVM',
    coreName: 'ScummVM',
    slowExit: true,
    location: locScummVm,
    background: 'images/app/scummvm-background.png',
    thumbnail: 'images/app/scummvm-thumb.png',
    description: "A custom port of ScummVM for webRcade, a specialized program designed to play hundreds of classic point-and-click graphic adventure games.",
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
    description: "A standalone source port using PrBoom, configured to play classic Doom engine games. Support is currently limited to pre-built free games, such as the Freedoom project and the original shareware episodes.",
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
// addAlias(types, APP_TYPE_KEYS.CDI, APP_TYPE_KEYS.RETRO_SAME_CDI);
addAlias(types, APP_TYPE_KEYS.DOS, APP_TYPE_KEYS.RETRO_DOSBOX_PURE);
addAlias(types, APP_TYPE_KEYS.GBA, APP_TYPE_KEYS.RETRO_MGBA);
// addAlias(types, APP_TYPE_KEYS.GBA, APP_TYPE_KEYS.RETRO_MGBA);
addAlias(types, APP_TYPE_KEYS.GB, APP_TYPE_KEYS.RETRO_SAMEBOY_GB);
addAlias(types, APP_TYPE_KEYS.GBC, APP_TYPE_KEYS.RETRO_SAMEBOY_GBC);
addAlias(types, APP_TYPE_KEYS.GENESIS, APP_TYPE_KEYS.RETRO_GENPLUSGX_MD);
addAlias(types, APP_TYPE_KEYS.GG, APP_TYPE_KEYS.RETRO_GENPLUSGX_GG);
addAlias(types, APP_TYPE_KEYS.LNX, APP_TYPE_KEYS.RETRO_MEDNAFEN_LYNX);
addAlias(types, APP_TYPE_KEYS.NEOGEO, APP_TYPE_KEYS.FBNEO_NEOGEO);
addAlias(types, APP_TYPE_KEYS.NEOGEOCD, APP_TYPE_KEYS.RETRO_NEOCD);
addAlias(types, APP_TYPE_KEYS.NDS, APP_TYPE_KEYS.RETRO_MELONDS);
addAlias(types, APP_TYPE_KEYS.NES, APP_TYPE_KEYS.RETRO_FCEUMM);
addAlias(types, APP_TYPE_KEYS.NGC, APP_TYPE_KEYS.RETRO_MEDNAFEN_NGC);
addAlias(types, APP_TYPE_KEYS.NGP, APP_TYPE_KEYS.RETRO_MEDNAFEN_NGP);
addAlias(types, APP_TYPE_KEYS.PCE, APP_TYPE_KEYS.RETRO_MEDNAFEN_PCE);
addAlias(types, APP_TYPE_KEYS.PCECD, APP_TYPE_KEYS.RETRO_PCE_FAST);
addAlias(types, APP_TYPE_KEYS.PCFX, APP_TYPE_KEYS.BEETLE_PCFX);
addAlias(types, APP_TYPE_KEYS.POKEMINI, APP_TYPE_KEYS.RETRO_POKEMINI);
// addAlias(types, APP_TYPE_KEYS.PSP, APP_TYPE_KEYS.RETRO_PPSSPP);
addAlias(types, APP_TYPE_KEYS.PSX, APP_TYPE_KEYS.BEETLE_PSX);
addAlias(types, APP_TYPE_KEYS.QUAKE, APP_TYPE_KEYS.TYRQUAKE);
// addAlias(types, APP_TYPE_KEYS.SATURN, APP_TYPE_KEYS.RETRO_YABAUSE);
addAlias(types, APP_TYPE_KEYS.SCUMM, APP_TYPE_KEYS.SCUMMVM);
addAlias(types, APP_TYPE_KEYS.SEGACD, APP_TYPE_KEYS.RETRO_GENPLUSGX_SEGACD);
addAlias(types, APP_TYPE_KEYS.SG1000, APP_TYPE_KEYS.RETRO_GENPLUSGX_SG);
addAlias(types, APP_TYPE_KEYS.SGX, APP_TYPE_KEYS.RETRO_MEDNAFEN_SGX);
addAlias(types, APP_TYPE_KEYS.SMS, APP_TYPE_KEYS.RETRO_GENPLUSGX_SMS);
addAlias(types, APP_TYPE_KEYS.SNES, APP_TYPE_KEYS.RETRO_SNES9X);
addAlias(types, APP_TYPE_KEYS.THREEDO, APP_TYPE_KEYS.RETRO_OPERA);
addAlias(types, APP_TYPE_KEYS.VB, APP_TYPE_KEYS.RETRO_MEDNAFEN_VB);
addAlias(types, APP_TYPE_KEYS.WSC, APP_TYPE_KEYS.RETRO_MEDNAFEN_WSC);
addAlias(types, APP_TYPE_KEYS.WS, APP_TYPE_KEYS.RETRO_MEDNAFEN_WS);

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
      description: "A modern, accuracy-focused emulator for the N64. It is very demanding on hardware and has many known quirks and incompatibilities when running the N64\'s notoriously difficult-to-emulate games.",
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
      description: "A Libretro core for emulating the Atari 5200. It brings the console's library to modern frontends with support for shaders and standardized controls.",
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
        cheat: "",
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

  //
  // Remove Saturn
  //

  for (let i = 0; i < clone.length; i++) {
    const t = clone[i];
    if ((!APP_TYPE_KEYS.RETRO_YABAUSE || t.key !== APP_TYPE_KEYS.RETRO_YABAUSE) &&
        (!APP_TYPE_KEYS.SATURN || t.key !== APP_TYPE_KEYS.SATURN)) {
      APP_TYPES.push(t);
    }
  }

  delete APP_TYPE_KEYS.RETRO_YABAUSE;
  delete APP_TYPE_KEYS.SATURN;

  //
  // Add Saturn
  //

  if (b) {
    APP_TYPE_KEYS.RETRO_YABAUSE = "retro-yabause";
    APP_TYPE_KEYS.SATURN = "saturn";

    APP_TYPES.push({
      key: APP_TYPE_KEYS.RETRO_YABAUSE,
      alias: APP_TYPE_KEYS.SATURN,
      name: 'Sega Saturn',
      shortName: 'Sega Saturn',
      coreName: 'Libretro Yabause',
      location: locRetroSaturn,
      description: "A Libretro core for emulating the Sega Saturn, delivering its classic CD-based library with modern rendering and shader support.",
      background: 'images/app/saturn-background.png',
      thumbnail: 'images/app/saturn-thumb.png',
      validate: checkDiscs,
      extensions: [],
      slowExit: true,
      multiThreaded: true,
      addProps: (feedProps, outProps) => {
        const bios = feedProps.saturn_bios;
        if (bios) {
          outProps.saturn_bios = bios;
        }
      },
      defaults: {
        discs: [],
        uid: "",
        zoomLevel: 0,
        forceEmulatedBios: false,
        ramExpansion: 0,
        // hack: 0
      }
    });
    addAlias(types, APP_TYPE_KEYS.SATURN, APP_TYPE_KEYS.RETRO_YABAUSE);
  }
}

const getStandaloneLocation = () => {
  return locStandalone;
}

const getAppStoragePath = (appType, postfix) => {
  return `/wrc/${appType}/${postfix}`;
}

export { enableExperimentalApps, getStandaloneLocation, getAppStoragePath, APP_TYPE_KEYS, APP_TYPES };
