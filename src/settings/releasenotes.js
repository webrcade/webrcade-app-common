export const ReleaseData = [
{
    version: "v0.2.2-p7",
    date: "May 24, 2026",
    title: "RetroAchievements & Local File Upload",
    preRelease: true,
    changes: [
      {
        title: "RetroAchievements",
        items: [
          "Added *RetroAchievements* support. Log in via *Settings* > *RetroAchievements* to earn and track achievements while you play.",
          "Achievements are supported for the following systems: *Atari 2600*, *Atari Lynx*, *Bandai WonderSwan / Color*, *ColecoVision*, *NEC PC Engine / TurboGrafx-16*, *NEC PC-FX*, *NEC SuperGrafx*, *Nintendo NES*, *Nintendo SNES*, *Nintendo 64*, *Nintendo Game Boy*, *Nintendo Game Boy Color*, *Nintendo Game Boy Advance*, *Nintendo DS*, *Nintendo Pokémon Mini*, *Nintendo Virtual Boy*, *Panasonic 3DO*, *Sega SG-1000*, *Sega Master System*, *Sega Genesis*, *Sega CD*, *Sega Game Gear*, *Sega Saturn*, *SNK Neo Geo CD*, *SNK Neo Geo Pocket / Color*, *Sony PlayStation*.",
          "When a game has achievements, an *Achievements* button will appear in the pause menu where you can see your progress.",
          "A notification will pop up on screen whenever an achievement is unlocked.",
          "Supports *softcore* mode, *rich presence*, and an in-game achievement list showing earned and unearned achievements for the current game.",
          "Note: *Hardcore mode* is not currently supported."
        ]
      },
      {
        title: "Player",
        items: [
          "Reworked pause menu layout and navigation to accommodate *Cheats* and *Achievements* buttons."
        ]
      },
      {
        title: "Editor: Cloud Storage",
        items: [
          "The editor now supports uploading both the feed and game assets (ROMs, disc images, BIOS files, images, etc.) directly to cloud storage. *Note: Cloud storage must be enabled in Settings to use these features.*",
          "Feeds can now be exported directly to cloud storage.",
          "Local files and folders can be uploaded via drag-and-drop onto the editor, or via the new *Add Local Files* and *Add Local Folder* options. Dropping a folder will recursively upload all supported files within it.",
          "The *Add Local Files* dialog shows upload progress for each file, with separate tabs for completed, skipped, and errored files.",
          "Image fields (thumbnails, backgrounds) now support uploading local files via drag-and-drop or via the field menu.",
          "File fields (ROMs, BIOS files, etc.) now support uploading local files via drag-and-drop or via the *Add file(s)...* option in the field menu.",
          "When adding local files, the editor will automatically determine the application type for files that weren't assigned one during upload, where possible."
        ]
      },
      {
        title: "Editor: General",
        items: [
          "Added a *Merge* dialog for combining like items of the same type into a single item, consolidating their discs and media into one entry."
        ]
      },
      {
        title: "Atari 2600",
        items: [
          "Improved audio support for iOS."
        ]
      },
      {
        title: "DOS",
        items: [
          "Added a *CPU Speed* property to DOS game settings in the editor. This allows selecting a CPU speed preset ranging from an 8086 at 4.77 MHz (1980) up to an AMD Athlon at 1.2 GHz (2000), or Maximum Performance. The default uses DOSBox's automatic CPU speed detection."
        ]
      },
      {
        title: "Nintendo DS",
        items: [
          "Added a *Firmware Language* property to Nintendo DS game settings in the editor. This allows specifying the language reported by the DS firmware ((Auto), English, Japanese, French, German, Italian, Spanish). Note: the selected language is only used if the game supports it."
        ]
      }
    ],
    image: "images/update3.png"
  },
{
    version: "v0.2.1",
    date: "April 29, 2026",
    title: "Cheats, Search & Bug Fixes",
    changes: [
      {
        title: "Cheats",
        items: [
          "Added *Cheats* support to the following systems: *Atari 2600*, *Atari 5200*, *Atari Lynx*, *NEC PC Engine / TurboGrafx-16*, *NEC PC Engine CD / TurboGrafx-CD*, *NEC SuperGrafx*, *Nintendo NES*, *Nintendo SNES*, *Nintendo Game Boy*, *Nintendo Game Boy Color*, *Nintendo Game Boy Advance*, *Nintendo DS*, *Sega SG-1000*, *Sega Master System*, *Sega Genesis*, *Sega CD*, *Sega Saturn*, *Sega Game Gear*, *Sony PlayStation*, *Quake*."
        ]
      },
      {
        title: "Player",
        items: [
          "Added *Search* support to the player, allowing you to quickly find games across all categories.",
          "Fixed an issue on *iOS* where closing a search or feed dialog after typing would leave the page scrolled to an incorrect position."
        ]
      },
      {
        title: "Editor",
        items: [
          "Added *Search* tab to the Feed Editor, allowing you to search, edit, copy, and analyze items across all categories.",
          "Added a *Cheats* tab to item properties for supported systems. A cheat file can be specified via URL, or selected from the built-in cheat database."
        ]
      },
      {
        title: "Bugs",
        items: [
          "Fixed an issue where gamepad navigation was not functioning in the *Shader Settings* tab of the *Nintendo DS* emulator settings.",
          "Fixed an issue where gamepad navigation was not functioning in the *Display* and *Shader Settings* tabs of the *Pokémon Mini* emulator settings."
        ]
      }
    ],
    image: "images/update2.png"
  },
{
    version: "v0.2.0",
    date: "March 23, 2026",
    title: "New Apps, Defaults & Shaders",
    changes: [
      {
        title: "The following applications have been added:",
        items: [
          "*Nintendo Pokémon Mini*",
          "*Sega Saturn* (Note: Requires *Experimental apps* to be enabled in *Settings* > *Advanced*)."
        ]
      },
      {
        title: "New application variants have been added and set as the *Default* for the following aliases (systems):",
        items: [
          "Atari Lynx: *Libretro Mednafen Lynx*",
          "Bandai WonderSwan / Color: *Libretro Mednafen Wswan*",
          "NEC PC Engine: *Libretro Mednafen PCEngine*",
          "NEC SuperGrafx: *Libretro Mednafen SuperGrafx*",
          "Nintendo Game Boy / Color: *Libretro SameBoy*",
          "Nintendo GBA: *Libretro mGBA*",
          "Nintendo NES: *Libretro FCEUmm*",
          "Nintendo SNES: *Libretro SNES9X*",
          "Nintendo Virtual Boy: *Libretro Mednafen VB*",
          "Sega Game Gear / Genesis / Master System / SG-1000: *Libretro Genesis Plus GX*",
          "SNK Neo Geo Pocket / Color: *Libretro Mednafen NGP*"
        ]
      },
      "You can now select the default *Application* to use for each alias (SNES, etc.) in *Settings* > *Applications*.",
      "*Important:* Because application defaults have changed, previous saves will not appear unless you map the previous application to the alias in *Settings* > *Applications*, or configure the specific item (game, etc.) to use the previous default application in the *Feed Editor*.",
      "Feeds can now specify the default application for an alias (SNES, etc.) via the *Feed Editor* (*Edit Feed* > *Applications* tab). *Note:* Device-specific user settings override feed settings.",
      "Added *Shader* support for many applications. These can be accessed via *Settings* > *Shaders* in the pause menu.",
      "Standalone link generation in the *Feed Editor* has changed from using *TinyURL* to *is.gd*."
    ],
    image: "images/update.png"
  }
];

// TODO: Add bilinear info
// TODO: Add sound updates across the board
