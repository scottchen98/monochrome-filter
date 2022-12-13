const path = require("path"),
  { unzip, readDir, grayScale } = require("./IOhandler"),
  zipFilePath = path.join(__dirname, "myfile.zip"),
  pathUnzipped = path.join(__dirname, "unzipped"),
  pathProcessed = path.join(__dirname, "grayscaled");

const promisesArr = [];

const run = async (pathIn, pathOut, pathGrayscale) => {
  try {
    const msg = await unzip(pathIn, pathOut);
    console.log(msg);
    const pngPaths = await readDir(pathOut);
    for (const pngPath of pngPaths) {
      const test = grayScale(pngPath, pathGrayscale);
      promisesArr.push(test);
    }
    console.log(promisesArr);
    const results = await Promise.all(promisesArr);
    console.log("Program complete.");
    console.log(results);
    console.log(promisesArr);
  } catch (err) {
    console.log(err);
  }
};

run(zipFilePath, pathUnzipped, pathProcessed);
