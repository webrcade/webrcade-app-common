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

export {
  blobToStr,
  isEmptyString,
  isValidString,
  limitString,
  u8ArrayToStr
}
