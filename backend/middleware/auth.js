const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey7125';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // For development without MongoDB, create a mock user object
    req.user = {
      id: decoded.id || 'dev-user-id',
      username: decoded.username || 'dev-user',
      ...decoded
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 