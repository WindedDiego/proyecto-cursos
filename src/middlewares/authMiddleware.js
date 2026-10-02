const jwt = require('jsonwebtoken');

const obtenerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  if (req.headers.cookie) {
    for (const cookie of req.headers.cookie.split(';')) {
      const separator = cookie.indexOf('=');
      const name = cookie.slice(0, separator).trim();
      if (name === 'token') {
        return cookie.slice(separator + 1).trim();
      }
    }
  }

  return null;
};

const authMiddleware = (req, res, next) => {
  const token = obtenerToken(req);
  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

authMiddleware.optional = (req, res, next) => {
  const token = obtenerToken(req);
  req.usuario = null;

  if (token) {
    try {
      req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      req.usuario = null;
    }
  }

  next();
};

module.exports = authMiddleware;