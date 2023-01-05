const testMagic = (bytes) => {
  if (bytes.length < 2) return false;

  // Probably too general, doesn't work for SGM-based games... :-(
  if (((bytes[0]==0x55)&&(bytes[1]==0xAA))||((bytes[0]==0xAA)&&(bytes[1]==0x55))) {
    return true;
  }

  if (bytes.length >= 0x4000) {
    const byte0 = bytes.length - 0x4000;
    const byte1 = bytes.length - 0x4000 + 1;
    return (((bytes[byte0]==0x55)&&(bytes[byte1]==0xAA))||((bytes[byte0]==0xAA)&&(bytes[byte1]==0x55)));
  }

  return false;
}

export { testMagic }
