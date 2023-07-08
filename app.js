const express = require('express')
const config = require('./db_connections/mdb');
const fs = require("fs");
const { connectToDb, getDb } = require('./db_connections/mdb')
//init app & middleware
const app = express()
//db connection
let db
connectToDb((err) => {
    if (!err) {
        app.listen(3000, () => {
            console.log(' server is connected to Database successfuly');
        })
        db = getDb()
    }
})
// localhost server......5050
app.listen(5050, () => {
    console.log('server is listening on port:5050...');
})
//routes....fetch all data from mongodb database

// Question 1. ..Answer... fetch data
app.get('/movie', (req, res) => {
    let movies = []
    db.collection('movies') // collection name
        .find()                        // show collection data
        .forEach(movie => movies.push(movie))
        .then(() => {
            res.status(200).json(movies)
        })
        .catch(() => {
            res.status(500).json({ err: 'could not fetch document' })
    })
})
//......................................................................
//Question 2....Answer.... fitch data movies by id ....

app.get('/movie/:id',(req,res) =>{
    db.collection('movies')
    .findOne({ _id:(req.params.id)})
    .then(doc => {
        res.status(200).json(doc)       
    })
    .catch(err =>{
        res.status(500).json({mssg:'Could not fetch the documents'})

    })
})
//.Question 3 ..Answer...........................................
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/video", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = "cartoon.mp4.mp4";
  const videoSize = fs.statSync("cartoon.mp4.mp4").size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

app.listen(8050, function () {
  console.log("Listening on port 8050......");
});