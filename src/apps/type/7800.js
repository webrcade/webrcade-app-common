const testMagic = (bytes) => {
  //console.log('Atari 7800: testMagic!');

  if (bytes.length < 0x10) return false;

  let str = "";
  for (let i = 0x1; i < 0x10; i++)
    str += String.fromCharCode(bytes[i]);
  return str.startsWith("ATARI7800");
}

export { testMagic }
