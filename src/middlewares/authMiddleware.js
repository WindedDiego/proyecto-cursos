const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    let token = null;

    // 1. Intentar leer del header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Si no está en el header, leerlo de las cookies del navegador
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') {
          token = value;
        }
      }
    }

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();

  } catch (error) {
    console.error('Error en authMiddleware:', error);
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};