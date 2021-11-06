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

const limitString = (str, limit) => {
  const len = str.length;
  if (str <= limit) {
    return str;
  } else {
    return str.substring(0, limit) + "...";
  }
}

export { blobToStr, limitString }
