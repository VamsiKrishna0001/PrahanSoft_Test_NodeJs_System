const express = require('express');
const Movie = require('../models/Movie');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');
const { upload } = require('../lib/storage');
const { readXlsxRows } = require('../lib/excel');
const { UPLOAD_DIR } = require('../lib/storage');
const {parseCsv, normalizeWatchedUsers, parseCsvIds, ParseArrayString} = require('../utils/helpers')
const path = require('path');
const fs = require('fs/promises');
const router = express.Router();


router.get('/', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const { genre, minRating, maxRating } = req.query;

    const filter = {};
    if (genre) filter.genres = { $in: [new RegExp(`^${genre}$`, 'i')] };
    if (minRating !== undefined) filter.rating = { ...(filter.rating || {}), $gte: Number(minRating) };
    if (maxRating !== undefined) filter.rating = { ...(filter.rating || {}), $lte: Number(maxRating) };

    const total = await Movie.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / limit));
    const data = await Movie.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });

    res.json({ data, page, limit, total, pages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('watchedUsers', 'email role');
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, rating, genres, watchedUsers } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const movie = new Movie({
      name,
      rating: Number(rating ?? 0),
      genres: parseCsv(genres),
      watchedUsers: parseCsvIds(watchedUsers),
    });
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth,  requireRole('admin'), async (req, res) => {
  try {
    const patch = {};
    if (req.body.name !== undefined) patch.name = req.body.name;
    if (req.body.rating !== undefined) patch.rating = Number(req.body.rating);
    if (req.body.genres !== undefined) patch.genres = parseCsv(req.body.genres);
    if (req.body.watchedUsers !== undefined) patch.watchedUsers = parseCsvIds(req.body.watchedUsers);

    const movie = await Movie.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk-upload', requireAuth, requireRole('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'file is required' });
    }
    const filePath = path.join(UPLOAD_DIR, req.file.filename);
    const rows = await readXlsxRows(filePath);

    const moviesToInsert = await Promise.all(
      rows.map(async (r) => ({
        name: r.name,
        rating: Number(r.rating) || 0,
        genres: ParseArrayString(r.genres ?? r.Genres),
        watchedUsers: await normalizeWatchedUsers(r.watchedUsers),
      }))
    );

    const inserted = await Movie.insertMany(moviesToInsert);

    try { await fs.unlink(filePath); } catch (e) { console.error("cleanup failed", e); }

    res.json({ insertedCount: inserted.length, movies: inserted });
  } catch (err) {
    console.error("bulk-upload error", err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/:movieId/watch/:userId', requireAuth, async (req, res) => {
  try {
    const { movieId, userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const movie = await Movie.findByIdAndUpdate(
      movieId,
      { $addToSet: { watchedUsers: user._id } },
      { new: true }
    ).populate("watchedUsers", "email role");
    console.log("movie", movie);
    
    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/:userId/watched-movies', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const movies = await Movie.find({ watchedUsers: userId })
      .select("name genres rating createdAt")

    res.json({ count: movies.length, movies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;