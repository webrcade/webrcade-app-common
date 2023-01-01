const testMagic = (bytes) => {
  if (bytes.length < 2) return false;

  // Probably too general, doesn't work for SGM-based games... :-(
  return (((bytes[0]==0x55)&&(bytes[1]==0xAA))||((bytes[0]==0xAA)&&(bytes[1]==0x55)));
}

export { testMagic }
