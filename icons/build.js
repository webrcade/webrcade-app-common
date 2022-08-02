const fs = require('fs');

const currDir = __dirname;
const srcDir = `${currDir}/src`;

let output = null;
fs.readdir(srcDir, (err, files) => {
  files.forEach(file => {
    if (output == null) {
      output = fs.createWriteStream(`${currDir}/../src/images/icons.js`, {
        flags: 'w'
      });
    }
    fs.readFile(`${srcDir}/${file}`, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const b64 =  Buffer.from(data, 'utf8').toString('base64');
      const name = file.split(".")[0].replace(/-/g, "_");
      const line = `export const ${name}='data:image/svg+xml;base64, ${b64}';\n\n`
      output.write(line);
    });
  });
});
