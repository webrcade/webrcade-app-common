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

export { blobToStr }
