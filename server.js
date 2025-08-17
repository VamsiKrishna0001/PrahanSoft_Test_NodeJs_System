require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const movieRoutes = require('./src/routes/movies');
const { errorHandler, notFound } = require('./src/middleware/error');

const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});