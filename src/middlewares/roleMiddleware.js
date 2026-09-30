module.exports = (rolPermitido) => {
  return (req, res, next) => {
    try {
      // El authMiddleware ya puso los datos del usuario en req.usuario
      const usuario = req.usuario;

      if (!usuario) {
        return res.status(401).json({ mensaje: 'Usuario no autenticado' });
      }

      // Verificar rol
      if (usuario.rol !== rolPermitido) {
        return res.status(403).json({ mensaje: 'No tienes permisos para acceder a esta ruta' });
      }

      // Si el rol coincide, continuar
      next();

    } catch (error) {
      console.error('Error en roleMiddleware:', error);
      return res.status(500).json({ mensaje: 'Error en la verificación de rol' });
    }
  };
};
