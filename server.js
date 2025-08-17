require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});