require('dotenv').config();
const connectDB = require("./config/db");
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function run() {
  await connectDB();
  console.log('Connected to Mongo for seeding');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123';
  const userEmail = process.env.USER_EMAIL || 'user@example.com';
  const userPass = process.env.USER_PASSWORD || 'User@123';

  const adminHash = await bcrypt.hash(adminPass, 10);
  await User.findOneAndUpdate({ email: adminEmail }, { email: adminEmail, password: adminHash, role: 'admin' }, { upsert: true });

  const userHash = await bcrypt.hash(userPass, 10);
  await User.findOneAndUpdate({ email: userEmail }, { email: userEmail, password: userHash, role: 'user' }, { upsert: true });

  console.log('Seeded admin and user');
  process.exit();
}

run().catch(err => { console.error(err); process.exit(1); });