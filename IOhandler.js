const { pipeline } = require("stream");

const { Extract } = require("unzipper"),
  fs = require("fs").promises,
  { createReadStream, createWriteStream } = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = (pathIn, pathOut) => {
  return createReadStream(pathIn)
    .on("error", (err) => console.log(err))
    .pipe(Extract({ path: pathOut }))
    .on("error", (err) => console.log(err))
    .promise()
    .then(() => "Extraction complete.")
    .catch((err) => console.log(err));
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = (dir) => {
  return fs.readdir(dir).then((filesArr) => {
    const filePaths = [];
    for (const file of filesArr) {
      if (path.extname(file) === ".png") {
        filePaths.push(path.join(dir, file));
      }
    }
    return filePaths;
  });
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */

const grayScale = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    const file = "grayscaled_" + path.parse(pathIn).base;
    const outputImg = path.join(pathOut, file);

    const readImg = createReadStream(pathIn);
    const writeImg = createWriteStream(outputImg);
    const png = new PNG();

    pipeline(
      readImg,
      png.on("parsed", function () {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;

            const red = this.data[idx];
            const green = this.data[idx + 1];
            const blue = this.data[idx + 2];
            const gray = (red + green + blue) / 3;

            this.data[idx] = this.data[idx + 1] = this.data[idx + 2] = gray;
          }
        }

        this.pack();
      }),
      writeImg.on("close", () => {
        resolve("Completed grayscaling");
      }),
      (err) => {
        if (err) {
          reject(err);
        }
      }
    );
  });
};

module.exports = {
  unzip,
  readDir,
  grayScale,
};
