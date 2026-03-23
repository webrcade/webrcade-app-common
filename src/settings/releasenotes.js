export const ReleaseData = [
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
