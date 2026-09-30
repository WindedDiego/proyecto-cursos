const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Leer token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Formato esperado: "Bearer token"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardar datos del usuario en la request
    req.usuario = decoded;

    // Continuar
    next();

  } catch (error) {
    console.error('Error en authMiddleware:', error);
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};
