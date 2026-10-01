module.exports = (rolesPermitidos) => {
    return (req, res, next) => {
        try {
            const usuario = req.usuario;

            if (!usuario) {
                return res.status(401).json({ mensaje: 'Usuario no autenticado' });
            }

            // Si rolesPermitidos es un string único, lo convertimos en array
            const rolesArray = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

            // Verificar si el rol del usuario está incluido en los permitidos
            if (!rolesArray.includes(usuario.rol)) {
                return res.status(403).json({ mensaje: 'No tienes permisos para acceder a esta sección' });
            }

            next();
        } catch (error) {
            console.error('Error en roleMiddleware:', error);
            return res.status(500).json({ mensaje: 'Error en la verificación de roles' });
        }
    };
};