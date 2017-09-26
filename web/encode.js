const ffmpeg = require("fluent-ffmpeg");
const gm = require("gm");
const Promise = require("bluebird");
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const rimraf = require("rimraf");

// Based on: https://superuser.com/questions/556029/how-do-i-convert-a-video-to-gif-using-ffmpeg-with-reasonable-quality

// // Clear out files
// let directory = "frames";
// fs.readdir(directory, (err, files) => {
//   if (err) throw error;

//   for (const file of files) {
//     fs.unlink(path.join(directory, file), err => {
//       if (err) throw error;

//       //ffmpeg -i input -vf scale=640:-1:flags=lanczos,fps=10 frames/ffout%03d.png
//       ffmpeg("test.mov")
//         .size("640x?")
//         .fps(10)
//         .save("frames/ffout%03d.png")
//         .on("end", () => {

//             gm("frames/ffout*.png")
//               .write("test.gif", err => {
//                 if (err) console.log(err);
//               });

//         });
//     });
//   }
// });

//ffmpeg -i test2.mov -vf chromakey=0x008001:0.25:0.0 -c:v qtrle out.mov
//ffmpeg -i test.mov -vf chromakey=0x9fb68f:0.25:0.0 -c:v qtrle out.mov

const extractFrames = filename =>
  new Promise((resolve, reject) => {
    let input_path = path.join(
      __dirname,
      "videos",
      "input",
      `${filename}.webm`
    );
    let frame_path = path.join(
      __dirname,
      "videos",
      "frames",
      `${filename}-%03d.png`
    );

    ffmpeg(input_path)
      .size("800x?")
      .fps(10)
      .save(frame_path)
      .on("end", err => {
        if (err) reject(err);
        console.log("extractFrames completed");
        resolve();
      });
  });

const convertAllFrames = filename => _ =>
  new Promise((resolve, reject) => {
    let frame_directory = path.join(__dirname, "videos", "frames");

    fs.readdir(frame_directory, (err, files) => {
      if (err) throw error;

      Promise.all(files.map(file => createAlphaMask(file))).then(resolve);
    });
  });

// https://making.lyst.com/2014/02/13/background-removal/
const createAlphaMask = filename =>
  new Promise((resolve, reject) => {
    let frame_path = path.join(__dirname, "videos", "frames", filename);
    let mask_path = path.join(__dirname, "videos", "masks", filename);
    let result_path = path.join(__dirname, "videos", "results", filename);

    gm(frame_path)
      .negative()
      .edge()
      // .blur(2)
      // .threshold(6, true)
      // .fill("magenta")
      // .draw("color 0,0 floodfill")
      // .transparent("magenta")
      .write(mask_path, err => {
        if (err) reject(err);
        console.log("createAlphaMask completed");

        gm(frame_path)
          .composite(mask_path)
          .compose("CopyOpacity")
          .write(result_path, function(err) {
            if (err) throw err;
          });
        resolve();
      });
  });

const overlayLogoOnAllFiles = filename => _ =>
  new Promise((resolve, reject) => {
    let frame_path = path.join(
      __dirname,
      "videos",
      "frames",
      `${filename}-*.png`
    );

    glob(frame_path, (err, files) => {
      if (err) throw err;

      let overlays = files.map(file_path => overlayLogo(file_path));

      Promise.all(overlays).then(_ => {
        resolve();
      });
    });
  });

const overlayLogo = file_path =>
  new Promise((resolve, reject) => {
    gm(file_path)
      .composite("images/overlay.png")
      .geometry("+0+450")
      .write(file_path, err => {
        if (err) throw err;

        resolve();
      });
  });

const convertToGif = filename => _ =>
  new Promise((resolve, reject) => {
    let frame_path = path.join(
      __dirname,
      "videos",
      "frames",
      `${filename}-*.png`
    );
    let output_path = path.join(
      __dirname,
      "videos",
      "output",
      `${filename}.gif`
    );

    gm(frame_path).write(output_path, err => {
      if (err) throw err;
      console.log("convertToGif completed");

      resolve();
    });
  });

const cleanup = filename => _ =>
  new Promise((resolve, reject) => {
    const handle_error = err => {
      if (err) console.log(err);
    };

    rimraf(`videos/input/${filename}*`, handle_error);
    rimraf(`videos/frames/${filename}*`, handle_error);
    rimraf(`videos/masks/${filename}*`, handle_error);

    resolve();
  });

const encode = filename =>
  extractFrames(filename)
    // .then(convertAllFrames(filename))
    .then(overlayLogoOnAllFiles(filename))
    .then(convertToGif(filename))
    .finally(cleanup(filename));

module.exports = encode;
