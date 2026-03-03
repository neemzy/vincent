const fs = require("fs");
const path = require("path");
const {Readable} = require("stream");
const {finished} = require("stream/promises");
const unzip = require("unzip");
const isWad = require("./isWad");

async function downloadWad(url, wadDir) {
  const tmpFolder = path.resolve(wadDir, url.split("/").pop()).replace(/\.zip$/, "");

  // Download and extract zip to temporary folder
  const wadRes = await fetch(url);
  await finished(Readable.fromWeb(wadRes.body).pipe(unzip.Extract({path: tmpFolder})));

  // Move relevant file(s) to their proper location
  await Promise.all(fs.readdirSync(tmpFolder).reduce((promises, file) => {
    if (isWad(file)) {
      promises.push(new Promise((resolve, reject) => {
        fs.rename(
          path.resolve(tmpFolder, file),
          path.resolve(wadDir, file),
          resolve
        );
      }));
    }

    return promises;
  }, []));

  // Remove temporary folder with its remaining contents
  fs.rmSync(tmpFolder, {force: true, recursive: true});
}

module.exports = downloadWad;
