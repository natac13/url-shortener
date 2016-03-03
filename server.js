import express from 'express';
import path from 'path'
import mongoose from 'mongoose';

import {
  handleUrls,
  getFromShort,
  testUrl
} from './app/middleware/url';

let connection;
if (process.env.NODE_ENV != 'production') {
  // load in the process.env variables
  require('dotenv').load();
  connection = mongoose.connect(process.env.DEV)
  console.log('Local DB being used.')
} else {
  connection = mongoose.connect(process.env.MONGO_URI)
}
connection
  .then(function connectSuccess() {
    console.log(`Connected to mongoDB via mongoose`);
  })
  .catch(function error(error) {
    throw error;
  });
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
const re = /new(?:\/(invalid))?\/((?:https?:\/\/)?.*)/


app.get(
  re,
  testUrl,
  handleUrls,
  (req, res) => {
    console.log('Save successful, Good Job Natac');

});

app.get('/:id', getFromShort);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3050;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});