const testInesMagic = (bytes) => {
  if (bytes.length < 4) return false;

  let str = "";
  for (let i = 0; i < 4; i++)
    str += String.fromCharCode(bytes[i]);

  let ret = false;
  if(str.startsWith("NES\x1a")) {
    ret = true;
  }
  return ret;
}

const testUnifMagic = (bytes) => {
  if (bytes.length < 4) return false;

  let str = "";
  for (let i = 0; i < 4; i++)
    str += String.fromCharCode(bytes[i]);

  let ret = false;
  if(str.startsWith("UNIF")) {
    ret = true;
  }
  return ret;
}

const testMagic = (bytes) => {
  //console.log('NES: testMagic!');

  return testInesMagic(bytes) || testUnifMagic(bytes);
}

export { testMagic }
