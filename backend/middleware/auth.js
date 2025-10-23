import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Format: "Bearer token_here"
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.warn(`authenticateToken: token missing for ${req.method} ${req.originalUrl} from ${req.ip}`);
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Log verification error type (do not log token)
      console.warn(`authenticateToken: jwt.verify failed for ${req.method} ${req.originalUrl} from ${req.ip} - ${err.name}: ${err.message}`);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; // store user info from token
    next();
  });
};
