const testMagic = (bytes) => {
  if (bytes.length < 0x100 + 15) return false;

  let str = "";
  for (let i = 0x100; i < 0x100 + 15; i++)
    str += String.fromCharCode(bytes[i]);

  if (str.startsWith("SEGA MEGA DRIVE") ||
    str.startsWith("SEGA GENESIS") ||
    str.startsWith("SEGA 32X") ||
    str.startsWith("SEGA") ||
    str.startsWith(" SEGA")) {
    return true;
  }
  return false;
}

export { testMagic }
