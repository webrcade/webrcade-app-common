import {
  LOG,
  blobToStr,
  md5,
} from '../../util';

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

const roundUpPow2 = (v) => {
  v--;
  v |= v >> 1;
  v |= v >> 2;
  v |= v >> 4;
  v |= v >> 8;
  v |= v >> 16;
  v++;
  v += (v == 0);
  return v;
}

const getMd5 = async (blob) => {
  let offset = 16;
  if (blob.size < offset) {
    return null;
  }

  const abuffer = await new Response(blob).arrayBuffer();
  const bufArray = new Uint8Array(abuffer);

  if (!testInesMagic(bufArray)) {
    // TODO: Support UNIF?
    return null;
  }

  const romSize = roundUpPow2(bufArray[4]);
  const vromSize = roundUpPow2(bufArray[5]);
  const romType = bufArray[6];

  if (romType & 4) {
    LOG.info('offset for trainer.');
    offset += 512;
  }

  const length = (romSize*0x4000) + (vromSize*0x2000);
  blob = blob.slice(offset, length + offset);

  return md5(await blobToStr(blob));
}

const testMagic = (bytes) => {
  return testInesMagic(bytes) || testUnifMagic(bytes);
}

export { testMagic, getMd5 }
