require('dotenv').config();
const connectDB = require("./config/db");
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Movie = require('./models/Movie');

async function run() {
  await connectDB();
  console.log('Connected to Mongo for seeding');

const usersData = [
    { email: process.env.ADMIN_EMAIL || 'admin@example.com', password: process.env.ADMIN_PASSWORD || 'Admin@123', role: 'admin' },
    { email: process.env.USER_EMAIL || 'user@example.com', password: process.env.USER_PASSWORD || 'User@123', role: 'user' },
    { email: 'user1@example.com', password: 'User1@123', role: 'user' },
    { email: 'user2@example.com', password: 'User2@123', role: 'user' },
    { email: 'user3@example.com', password: 'User3@123', role: 'user' }
  ];

  for (const u of usersData) {
    const hash = await bcrypt.hash(u.password, 10);
    await User.findOneAndUpdate(
      { email: u.email },
      { email: u.email, password: hash, role: u.role },
      { upsert: true, new: true }
    );
  }

  console.log('Seeded admin and user');
    
   const moviesData = [
    { name: 'RRR', rating: 9, genres: ['Action', 'Drama'], watchedUsers: [] },
    { name: 'Pushpa: The Rise', rating: 8, genres: ['Action', 'Thriller'], watchedUsers: [] },
    { name: 'Salaar', rating: 8, genres: ['Action'], watchedUsers: [] },
    { name: 'Hi Nanna', rating: 7, genres: ['Romance', 'Drama'], watchedUsers: [] },
    { name: 'Devara', rating: 0, genres: ['Action'], watchedUsers: [] }
  ];

  for (const m of moviesData) {
    await Movie.findOneAndUpdate(
      { name: m.name },
      m,
      { upsert: true, new: true }
    );
  }
   console.log('Seeded movies');
  process.exit();
}

run().catch(err => { console.error(err); process.exit(1); });