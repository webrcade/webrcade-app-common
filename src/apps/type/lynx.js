import {
  blobToStr,
  md5,
} from '../../util';

const testMagic = (bytes) => {
  if (bytes.length < 4) return false;

  let str = "";
  for (let i = 0; i < 4; i++)
    str += String.fromCharCode(bytes[i]);
  return str.startsWith("LYNX");
}

const getMd5 = async (blob) => {
  const abuffer = await new Response(blob).arrayBuffer();
  if (testMagic(new Uint8Array(abuffer)) && blob.size > 0x40) {
    blob = blob.slice(0x40);
    return md5(await blobToStr(blob));
  }
  return null;
}

export { getMd5, testMagic }
