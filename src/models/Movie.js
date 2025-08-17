const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 10 },
  genres: { type: [String], default: [] },
  watchedUsers:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] 
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);