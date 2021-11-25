import {
  blobToStr,
  md5,
} from '../../util';

const testMagic = (bytes) => {
  if (bytes.length < 0x10) return false;

  let str = "";
  for (let i = 0x1; i < 0x10; i++)
    str += String.fromCharCode(bytes[i]);
  return str.startsWith("ATARI7800");
}

const getMd5 = async (blob) => {
  const abuffer = await new Response(blob).arrayBuffer();
  if (testMagic(new Uint8Array(abuffer)) && blob.size > 0x80) {
    blob = blob.slice(0x80);
    return md5(await blobToStr(blob));
  }
  return null;
}

export { testMagic, getMd5 }
