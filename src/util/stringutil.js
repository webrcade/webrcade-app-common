const blobToStr = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reader.abort();
      reject(reader.error);
    };

    reader.onload = () => {
      const result = reader.result;
      resolve(reader.result);
    };
    reader.readAsBinaryString(blob);
  });
}

function u8ArrayToStr(u8Array) {
	var i, len = u8Array.length, b_str = "";
	for (i=0; i<len; i++) {
		b_str += String.fromCharCode(u8Array[i]);
	}
	return b_str;
}

const isEmptyString = (str) => {
  return str === undefined || !str || str.length === 0;
}

const isValidString = (str) => {
  return str !== undefined && str && str.length > 0;
}

const limitString = (str, limit) => {
  const len = str.length;
  if (str <= limit) {
    return str;
  } else {
    return str.substring(0, limit) + "...";
  }
}

const strReplaceAll = (str, find, replace) => {
  return str.split(find).join(replace);
}

// Strips the longest common prefix from an array of names, using paren boundaries
// where possible. Returns a new array of shortened names. Falls back to full names
// when there is no common prefix or the common prefix is fewer than 4 characters
// (to avoid stripping a single coincidental leading character like "S").
const computeShortNames = (names) => {
  if (names.length < 2) return [...names];
  const compare = names[0];
  let commonEnd = 0, startParen = -1, anyUnique = false;
  outer:
  for (commonEnd = 0; commonEnd < compare.length; commonEnd++) {
    for (let i = 1; i < names.length; i++) {
      const cur = names[i];
      if (commonEnd >= cur.length - 1) break outer;
      if (cur[commonEnd] === '(') startParen = commonEnd;
      else if (cur[commonEnd] === ')') startParen = -1;
      if (cur[commonEnd] !== compare[commonEnd]) { anyUnique = true; break outer; }
    }
  }
  if (!anyUnique) return [...names];
  const cutAt = startParen !== -1 ? startParen : commonEnd >= 4 ? commonEnd : 0;
  return names.map(n => n.substring(cutAt) || n);
};

export {
  blobToStr,
  computeShortNames,
  isEmptyString,
  isValidString,
  limitString,
  strReplaceAll,
  u8ArrayToStr
}
