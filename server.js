import express from 'express';
import path from 'path'
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import {
  handleUrls,
  getFromShort
} from './app/middleware/url';

// load in the process.env variables
dotenv.load();


mongoose.connect(process.env.MONGO_URI)
  .then(function connectSuccess() {
    console.log(`Connected to mongoDB via mongoose`);
  })
  .catch(function error(error) {
    throw error;
  });
const app = express();


app.get(/new\/((?:https?:\/\/)?.*)/ , handleUrls, (req, res) => {
  console.log(req.params);
  const { url } = req.params;

});

app.get(`/:id`, getFromShort, (req, res) => {

});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3050;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});