function md5Uint8Array(input) {
  const K = new Int32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ]);

  const S = new Uint8Array([
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
  ]);

  function leftRotate(x, c) {
    return (x << c) | (x >>> (32 - c));
  }

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const len = input.length;
  const bitLen = len * 8;

  const block = new Uint8Array(64);
  const X = new Int32Array(16);

  let i = 0;
  while (i + 64 <= len) {
    for (let j = 0; j < 64; j++) block[j] = input[i + j];
    transform(block);
    i += 64;
  }

  let rem = len - i;
  block.fill(0);
  for (let j = 0; j < rem; j++) block[j] = input[i + j];
  block[rem] = 0x80;

  if (rem >= 56) {
    transform(block);
    block.fill(0);
  }

  const dv = new DataView(block.buffer);
  dv.setUint32(56, bitLen, true);

  transform(block);

  const out = new DataView(new ArrayBuffer(16));
  out.setUint32(0, a, true);
  out.setUint32(4, b, true);
  out.setUint32(8, c, true);
  out.setUint32(12, d, true);

  let hex = "";
  for (let i = 0; i < 16; i++) {
    let h = out.getUint8(i).toString(16);
    if (h.length === 1) h = "0" + h;
    hex += h;
  }
  return hex;

  function transform(block) {
    for (let i = 0; i < 16; i++) {
      const j = i * 4;
      X[i] = block[j] | (block[j + 1] << 8) | (block[j + 2] << 16) | (block[j + 3] << 24);
    }

    let [aa, bb, cc, dd] = [a, b, c, d];

    for (let j = 0; j < 64; j++) {
      let f, g;
      if (j < 16) {
        f = (b & c) | (~b & d); g = j;
      } else if (j < 32) {
        f = (d & b) | (~d & c); g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d; g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d); g = (7 * j) % 16;
      }

      const tmp = d;
      d = c;
      c = b;
      b = (b + leftRotate((a + f + K[j] + X[g]) | 0, S[j])) | 0;
      a = tmp;
    }

    a = (a + aa) | 0;
    b = (b + bb) | 0;
    c = (c + cc) | 0;
    d = (d + dd) | 0;
  }
}

export { md5Uint8Array };

/* Faster, but uses way too much memory
function md5Uint8Array(input) {
  const K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];

  const S = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
  ];

  function leftRotate(x, c) {
    return (x << c) | (x >>> (32 - c));
  }

  function toWords(buffer, offset) {
    const words = new Int32Array(16);
    for (let i = 0; i < 16; i++) {
      const j = offset + i * 4;
      words[i] = buffer[j] | (buffer[j + 1] << 8) | (buffer[j + 2] << 16) | (buffer[j + 3] << 24);
    }
    return words;
  }

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const len = input.length;
  const fullLen = len + 1 + 8;
  const paddedLen = ((fullLen + 63) >> 6) << 6; // Round up to multiple of 64
  const buffer = new Uint8Array(paddedLen);
  buffer.set(input);
  buffer[len] = 0x80;

  const bitLen = len * 8;
  buffer[paddedLen - 8] = bitLen & 0xff;
  buffer[paddedLen - 7] = (bitLen >>> 8) & 0xff;
  buffer[paddedLen - 6] = (bitLen >>> 16) & 0xff;
  buffer[paddedLen - 5] = (bitLen >>> 24) & 0xff;
  // The high 32 bits are zero in JavaScript

  for (let i = 0; i < paddedLen; i += 64) {
    const X = toWords(buffer, i);
    let [aa, bb, cc, dd] = [a, b, c, d];

    for (let j = 0; j < 64; j++) {
      let div16 = j >> 4;
      let f, g;
      if (div16 === 0) {
        f = (b & c) | (~b & d);
        g = j;
      } else if (div16 === 1) {
        f = (d & b) | (~d & c);
        g = (5 * j + 1) % 16;
      } else if (div16 === 2) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * j) % 16;
      }

      const tmp = d;
      d = c;
      c = b;
      b = b + leftRotate((a + f + K[j] + X[g]) | 0, S[j]) | 0;
      a = tmp;
    }

    a = (a + aa) | 0;
    b = (b + bb) | 0;
    c = (c + cc) | 0;
    d = (d + dd) | 0;
  }

  const hash = new Uint8Array(16);
  const view = new DataView(hash.buffer);
  view.setUint32(0, a, true);
  view.setUint32(4, b, true);
  view.setUint32(8, c, true);
  view.setUint32(12, d, true);

  return Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
}
 export { md5Uint8Array }
 */