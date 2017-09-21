const express = require("express");
const app = express();
const fileUpload = require('express-fileupload');

app.use(express.static(__dirname));
app.use(fileUpload());

app.get("/hello", function(req, res) {
  res.send("Hello World!");
});

app.post("/save", function(req, res) {
  console.log(req);
  if (!req.files) return res.status(400).send("No files were uploaded.");

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let video = req.files.video;

  // Use the mv() method to place the file somewhere on your server
  let filename = Date.now();
  video.mv(`videos/input/${filename}.webm`, function(err) {
    if (err) return res.status(500).send(err);

    res.send(`videos/output/${filename}.gif`);
  });
});

app.listen(3000, function() {
  console.log("Example app listening on port 3000!");
});
