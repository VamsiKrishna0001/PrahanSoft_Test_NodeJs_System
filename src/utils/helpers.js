const mongoose = require('mongoose');

function parseCsv(v) {
  if (!v && v !== 0) return [];
  if (Array.isArray(v)) return v;
  return String(v).split(',').map(s => s.trim()).filter(Boolean);
}

async function normalizeWatchedUsers(value) {
  if (!value) return [];

  let ids = [];

  if (Array.isArray(value)) {
    ids = value;
  }

  else if (typeof value === "string") {
    try {
      let cleaned = value.replace(/'/g, '"');
      ids = JSON.parse(cleaned);
    } catch (err) {
      console.error("Error parsing watchedUsers:", value, err);
      return [];
    }
  }
  ids = ids.filter(v => mongoose.Types.ObjectId.isValid(v));

  const validUsers = await User.find({ _id: { $in: ids } }).select("_id");
  return validUsers.map(u => u._id);
}

function parseCsvIds(v) {
  if (!v && v !== 0) return [];
  if (Array.isArray(v)) return v.map(String);
  return String(v)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(id => new mongoose.Types.ObjectId(id)); 
}

function ParseArrayString(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(v.replace(/'/g, '"'));
    const a = Array.isArray(parsed) ? parsed : [parsed];
    console.log("xlsParseArrayString", a);
    
    return a;
  } catch (e) {
    console.log("e", e);
    
    return String(v).split(",").map(s => s.trim()).filter(Boolean);
  }
}

module.exports = {parseCsv, normalizeWatchedUsers, parseCsvIds, ParseArrayString}
