const jwt = require('jsonwebtoken');
const createError = require('http-errors');

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return next(createError(401, 'Missing || invalid Authorization header'));
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = payload; 
    next();
  } catch (err) {
    return next(createError(401, 'Invalid or expired token'));
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(createError(401, 'Unauthorized'));
    if (req.user.role !== role) return next(createError(403, 'Forbidden'));
    next();
  };
}

module.exports = { requireAuth, requireRole };