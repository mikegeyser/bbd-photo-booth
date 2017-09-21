const ffmpeg = require("fluent-ffmpeg");
const gm = require("gm");
const Promise = require("bluebird");
const fs = require("fs");
// Based on: https://superuser.com/questions/556029/how-do-i-convert-a-video-to-gif-using-ffmpeg-with-reasonable-quality

let directory = "frames";
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

const extractFrames = _ =>
  new Promise((resolve, reject) => {
    ffmpeg("out.mov")
      .size("640x?")
      .fps(10)
      .save("frames/ffout%03d.png")
      .on("end", err => {
        if (err) reject(err);
        console.log("extractFrames completed");
        resolve();
      });
  });

const convertAllFrames = _ =>
  new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) throw error;

      Promise.all(files.map(file => createAlphaMask(file))).then(resolve);
    });
  });

// https://making.lyst.com/2014/02/13/background-removal/
const createAlphaMask = filename =>
  new Promise((resolve, reject) => {
    gm(`frames/${filename}`)
      .negative()
      .edge()
      // .blur(2)
      // .threshold(6, true)
      // .fill("magenta")
      // .draw("color 0,0 floodfill")
      // .transparent("magenta")
      .write(`masks/${filename}`, err => {
        if (err) reject(err);
        console.log("createAlphaMask completed");

        gm(`frames/${filename}`)
          .composite(`masks/${filename}`)
          .compose("CopyOpacity")
          .write(`results/${filename}`, function(err) {
            if (err) throw err;
          });
        resolve();
      });
  });

const convertToGif = _ =>
  new Promise((resolve, reject) => {
    setTimeout(_ => {
      gm("frames/ffout*.png").write("test.gif", err => {
        if (err) reject(err);
        console.log("convertToGif completed");

        resolve();
      });
    }, 10000);
  });

const convertToGif2 = _ =>
  new Promise((resolve, reject) => {
    setTimeout(_ => {
      ffmpeg("frames/ffout%03d.png")
        .save("test.gif")
        .on("end", err => {
          if (err) reject(err);
          console.log("convertToGif2 completed");
          resolve();
        });
    }, 10000);
  });

extractFrames()
  // .then(convertAllFrames)
  // .then(convertToGif);
