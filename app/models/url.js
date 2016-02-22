import mongoose, { Schema } from 'mongoose';

const Url = new Schema({
  originalUrl: String,
  shortUrl: String,
  idUrl: Number
});

export default mongoose.model('Url', Url);